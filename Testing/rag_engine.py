import networkx as nx
from transformers import pipeline
from schema_graph_builder import SchemaGraphBuilder
from explain_sql import SQLExplainer
import sqlparse

class RAGEngine:
    def __init__(self, schema_path, use_llm=True):
        self.schema_graph = self._build_kg(schema_path)
        self.explainer = SQLExplainer(use_llm=False)
        self.generator = pipeline("text2text-generation", model="t5-small") if use_llm else None

    def _build_kg(self, schema_path):
        builder = SchemaGraphBuilder()
        builder.parse_schema_file(schema_path)
        return builder.get_graph()

    def _retrieve_schema_context(self, sql_query):
        parsed = sqlparse.parse(sql_query)[0]
        tokens = [t for t in parsed.tokens if not t.is_whitespace]
        mentioned_tables = []

        for token in tokens:
            if token.ttype is None and token.get_real_name():
                name = token.get_real_name()
                if name in self.schema_graph:
                    mentioned_tables.append(name)

        context = []
        for table in set(mentioned_tables):
            columns = [
                v for u, v, d in self.schema_graph.edges(data=True)
                if u == table and d['type'] == 'has_column'
            ]
            context.append(f"Table `{table}` has columns: {', '.join(c.split('.')[-1] for c in columns)}")

            foreign_keys = [
                (u, v, d) for u, v, d in self.schema_graph.edges(data=True)
                if d['type'] == 'foreign_key' and u == table
            ]
            for _, target, fk in foreign_keys:
                context.append(f"Table `{table}` links to `{target}` via `{fk['from_col']}` → `{fk['to_col']}`")

        return "\n".join(context)

    def generate_documentation(self, sql_query):
        """Handle SQL input → documentation"""
        base_explanation = self.explainer.explain(sql_query)
        schema_context = self._retrieve_schema_context(sql_query)

        if self.generator:
            prompt = f"""SQL Query: {sql_query}

Schema Info:
{schema_context}

Explain the SQL query in natural language, using schema context to make it clear:
"""
            generated = self.generator(prompt, max_length=200, do_sample=False)[0]['generated_text']
            return generated
        else:
            return f"{base_explanation}\n\n[Schema Context]\n{schema_context}"

    def answer_nl_question(self, user_question):
        """Handle natural language question input → answer"""
        context_lines = []
        for node in self.schema_graph.nodes:
            if self.schema_graph.nodes[node].get('type') == 'table':
                columns = [
                    v for u, v, d in self.schema_graph.edges(data=True)
                    if u == node and d['type'] == 'has_column'
                ]
                context_lines.append(f"Table `{node}` has columns: {', '.join(c.split('.')[-1] for c in columns)}")

                foreign_keys = [
                    (u, v, d) for u, v, d in self.schema_graph.edges(data=True)
                    if d['type'] == 'foreign_key' and u == node
                ]
                for _, target, fk in foreign_keys:
                    context_lines.append(f"Table `{node}` links to `{target}` via `{fk['from_col']}` → `{fk['to_col']}`")

        schema_context = "\n".join(context_lines)

        prompt = f"""
You are an expert in software systems. Given the following database schema:

{schema_context}

Answer this question clearly and helpfully:
{user_question}
"""
        result = self.generator(prompt, max_length=250, do_sample=False)[0]['generated_text']
        return result
