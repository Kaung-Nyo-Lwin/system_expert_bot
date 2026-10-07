"""Deterministic SQL inspection. No database connections or model calls."""

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError


def parse_schema(schema_sql):
    try:
        statements = sqlglot.parse(schema_sql, read="mysql")
    except ParseError as exc:
        raise ValueError("The schema could not be parsed. Use MySQL CREATE TABLE statements.") from exc
    schema = {}
    for statement in statements:
        if statement is None:
            continue
        if not isinstance(statement, exp.Create) or statement.kind != "TABLE" or not isinstance(statement.this, exp.Schema) or statement.expression is not None:
            raise ValueError("The schema must contain CREATE TABLE statements only.")
        table = statement.this.this.name
        columns = {column.name: column.args["kind"].sql(dialect="mysql") for column in statement.find_all(exp.ColumnDef)}
        if not columns:
            raise ValueError(f"Add column definitions for {table}.")
        if table in schema:
            raise ValueError(f"The schema defines {table} more than once.")
        schema[table] = columns
    if not schema:
        raise ValueError("Add at least one CREATE TABLE statement to the schema.")
    return schema


def analyze_sql(schema_sql, query):
    schema = parse_schema(schema_sql)
    try:
        statements = [statement for statement in sqlglot.parse(query, read="mysql") if statement is not None]
    except ParseError as exc:
        raise ValueError("The SQL could not be parsed. Check the syntax and try again.") from exc
    if len(statements) != 1 or not isinstance(statements[0], exp.Select):
        raise ValueError("The local explainer supports one SELECT query at a time.")
    parsed = statements[0]
    if parsed.args.get("with") or parsed.args.get("with_") or list(parsed.find_all(exp.Subquery)) or len(list(parsed.find_all(exp.Select))) > 1:
        raise ValueError("The local explainer supports SELECT with joins, filters, and aggregations. CTEs and nested queries require the research models.")
    if not parsed.expressions or parsed.args.get("into"):
        raise ValueError("Use a SELECT query with output columns and without INTO.")
    tables = sorted({table.name for table in parsed.find_all(exp.Table)})
    unknown = set(tables) - schema.keys()
    if unknown:
        raise ValueError(f"Tables missing from the schema: {', '.join(sorted(unknown))}.")
    aliases = {table.alias_or_name: table.name for table in parsed.find_all(exp.Table)}
    nodes = [{"id": "query", "label": "Your query", "group": "query"}]
    edges = []
    for table in tables:
        nodes.append({"id": f"table:{table}", "label": table, "group": "table"})
        edges.append({"from": "query", "to": f"table:{table}", "label": "reads"})
    seen = set()
    output_aliases = {item.alias for item in parsed.expressions if item.alias}
    for column in parsed.find_all(exp.Column):
        if column.is_star:
            continue
        table = aliases.get(column.table) if column.table else None
        if table is None and not column.table:
            candidates = [name for name in tables if column.name in schema[name]]
            table = candidates[0] if len(candidates) == 1 else None
            if not candidates and column.name not in output_aliases:
                raise ValueError(f"Column {column.name} is missing from the referenced tables.")
        if table is None:
            if column.table:
                raise ValueError(f"Unknown table alias: {column.table}.")
            continue  # Output aliases and ambiguous columns are not assigned to a table.
        if column.name not in schema[table]:
            raise ValueError(f"Column {column.name} is missing from table {table}.")
        identifier = f"column:{table}.{column.name}"
        if identifier not in seen:
            seen.add(identifier)
            nodes.append({"id": identifier, "label": column.name, "group": "column"})
            edges.append({"from": f"table:{table}", "to": identifier, "label": "contains"})

    def sql(expression):
        return expression.sql(dialect="mysql")

    lines = ["## Query overview", "This SELECT describes a result set; SoftwareDocBot does not execute it.", "", "### Step by step"]
    steps = []
    if tables:
        steps.append("Read from " + ", ".join(f"`{table}`" for table in tables) + ".")
    for join in parsed.args.get("joins") or []:
        condition = join.args.get("on")
        kind = " ".join(filter(None, [join.side, join.kind])) or "INNER"
        using = join.args.get("using")
        detail = f" on `{sql(condition)}`" if condition is not None else (" using " + ", ".join(f"`{sql(item)}`" for item in using) if using else "")
        steps.append(f"Apply a {kind} JOIN to `{sql(join.this)}`{detail}.")
    where = parsed.args.get("where")
    if where:
        steps.append(f"Keep rows where `{sql(where.this)}`.")
    group = parsed.args.get("group")
    if group:
        steps.append("Group rows by " + ", ".join(f"`{sql(item)}`" for item in group.expressions) + ".")
    having = parsed.args.get("having")
    if having:
        steps.append(f"Keep groups where `{sql(having.this)}`.")
    steps.append("Return " + ", ".join(f"`{sql(item)}`" for item in parsed.expressions) + ".")
    if parsed.args.get("distinct"):
        steps.append("Remove duplicate result rows with DISTINCT.")
    order = parsed.args.get("order")
    if order:
        steps.append("Sort by " + ", ".join(f"`{sql(item)}`" for item in order.expressions) + ".")
    offset = parsed.args.get("offset")
    if offset:
        steps.append(f"Skip the first `{sql(offset.expression)}` result rows.")
    limit = parsed.args.get("limit")
    if limit:
        steps.append(f"Return at most `{sql(limit.expression)}` rows.")
    lines.extend(f"{index}. {step}" for index, step in enumerate(steps, 1))
    lines.extend(["", "### Scope", "This is a structural explanation from the SQL parser, not an AI-generated answer. It does not verify business intent, data quality, or query performance. Unqualified columns with multiple possible source tables are omitted from the graph."])
    return {"output": "\n".join(lines), "nodes": nodes, "edges": edges, "tables": tables}
