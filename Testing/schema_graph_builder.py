import sqlparse
import networkx as nx
import re

class SchemaGraphBuilder:
    def __init__(self):
        self.graph = nx.DiGraph()

    def parse_schema_file(self, schema_file):
        with open(schema_file, 'r') as f:
            sql = f.read()
        statements = sqlparse.parse(sql)

        for stmt in statements:
            if stmt.get_type() == 'CREATE':
                self._parse_create_table(stmt)

    def _parse_create_table(self, statement):
        tokens = [t for t in statement.tokens if not t.is_whitespace]
        table_name = None

        for i, token in enumerate(tokens):
            if token.match(sqlparse.tokens.Keyword, 'TABLE'):
                table_name = str(tokens[i+2])
                self.graph.add_node(table_name, type='table')

                columns_block = str(tokens[i+3])
                column_lines = columns_block.strip('() \n').split(',')

                for col_def in column_lines:
                    parts = col_def.strip().split()
                    if len(parts) < 2:
                        continue
                    col_name = parts[0]

                    # Detect foreign key
                    if 'FOREIGN KEY' in col_def:
                        match = re.search(r'FOREIGN KEY \((.*?)\) REFERENCES (\w+)\((.*?)\)', col_def, re.IGNORECASE)
                        if match:
                            fk_col, ref_table, ref_col = match.groups()
                            self.graph.add_edge(table_name, ref_table, type='foreign_key', from_col=fk_col, to_col=ref_col)
                    elif col_name.upper() not in ['PRIMARY', 'FOREIGN', 'CONSTRAINT']:
                        col_node = f"{table_name}.{col_name}"
                        self.graph.add_node(col_node, type='column')
                        self.graph.add_edge(table_name, col_node, type='has_column')

    def get_graph(self):
        return self.graph
