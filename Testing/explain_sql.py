import sqlparse
from transformers import pipeline

class SQLExplainer:
    def __init__(self, use_llm=False):
        self.use_llm = use_llm
        if use_llm:
            self.generator = pipeline("text2text-generation", model="t5-small")

    def template_explain(self, query):
        parsed = sqlparse.parse(query)[0]
        tokens = [token for token in parsed.tokens if not token.is_whitespace]

        explanation = []

        for i, token in enumerate(tokens):
            if token.ttype is None and token.get_real_name():
                continue
            if token.ttype is sqlparse.tokens.DML and token.value.upper() == "SELECT":
                explanation.append("This query retrieves")
                columns = str(tokens[i+1]).strip().replace("\n", " ")
                explanation.append(columns)
            elif token.ttype is sqlparse.tokens.Keyword and token.value.upper() == "FROM":
                table = str(tokens[i+1]).strip()
                explanation.append(f"from the '{table}' table")
            elif token.ttype is sqlparse.tokens.Keyword and token.value.upper() == "WHERE":
                condition = str(tokens[i+1]).strip().replace("\n", " ")
                explanation.append(f"where the condition '{condition}' is met")

        return " ".join(explanation)

    def llm_explain(self, query):
        prompt = f"Explain this SQL query in simple English:\n{query}"
        result = self.generator(prompt, max_length=100, do_sample=False)[0]['generated_text']
        return result

    def explain(self, query):
        if self.use_llm:
            return self.llm_explain(query)
        else:
            return self.template_explain(query)