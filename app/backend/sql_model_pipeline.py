from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSeq2SeqLM, pipeline
from peft import PeftModel
import sqlglot
import torch
from sqlglot import expressions

base_llama_model = AutoModelForCausalLM.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    device_map="cpu",
    torch_dtype=torch.float32
)

explainer_model = PeftModel.from_pretrained(base_llama_model, 'tinyllama-sql-explainer-full/')
llama_tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")

sql_gen_model_path = "./fine-tuned-t5-small-sql"
sql_gen_model = AutoModelForSeq2SeqLM.from_pretrained(sql_gen_model_path)
t5_tokenizer = AutoTokenizer.from_pretrained(sql_gen_model_path)


pipe = pipeline(
    "text-generation",
    model=explainer_model,
    tokenizer=llama_tokenizer,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)


def generate_sql(question, context):
    # Format input as during fine-tuning
    input_text = f"question: {question} context: {context}"
    
    # Tokenize input
    inputs = t5_tokenizer(
        input_text,
        max_length=512,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    
    # Move inputs to the same device as the model
    inputs = {key: value.to(sql_gen_model.device) for key, value in inputs.items()}
    
    # Generate output
    outputs = sql_gen_model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=128,  # Adjust based on expected SQL query length
        num_beams=4,    # Beam search for better results
        early_stopping=True
    )
    
    # Decode the generated tokens to text
    sql_query = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
    return sql_query


def parse_schema(sql_context):
    dialects = ["sqlite", "mysql", "postgres"]
    schema = {}

    # Preprocess sql_context to split statements and filter CREATE TABLE
    statements = [s.strip() for s in sql_context.split(";") if s.strip()]
    create_statements = [s for s in statements if s.upper().startswith("CREATE TABLE")]

    if not create_statements:
        print(f"No CREATE TABLE statements found in: {sql_context[:100]}...")
        return {}

    for dialect in dialects:
        try:
            for stmt in create_statements:
                parsed = sqlglot.parse_one(stmt, read=dialect)
                if isinstance(parsed, expressions.Create) and isinstance(parsed.this, expressions.Table):
                    table_name = parsed.this.this
                    columns = []
                    schema_expr = parsed.expression
                    if isinstance(schema_expr, expressions.Schema):
                        for col in schema_expr.expressions:
                            if isinstance(col, expressions.ColumnDef):
                                col_name = col.this.this if isinstance(col.this, expressions.Identifier) else str(col.this)
                                columns.append(col_name)
                    schema[table_name] = columns
            return schema
        except Exception as e:
            print(f"Error parsing with {dialect}: {e}")
            continue

    print(f"Failed to parse schema with all dialects: {sql_context[:100]}...")
    return {}


def generate_explanation(schema, question, sql_query):
    schema = parse_schema(schema)
    schema_summary = "\n".join([f"Table {table}: {', '.join(cols)}" for table, cols in schema.items()]) or "No schema parsed."


    messages = [
      {
          "role": "system",
          "content": (
              "You are an SQL expert who explains SQL queries clearly. Given a database schema, a natural language query, "
              "and the corresponding SQL query, provide a step-by-step explanation of how the SQL query works."
          )
      },
      {
          "role": "user",
          "content": (
              f"**User Question**: {question}\n"
              f"**Schema Overview**: {schema_summary}\n"
              f"**SQL Query**: {sql_query}"
          )
      }
    ]
    prompt = llama_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    outputs = pipe(
      prompt,
      max_new_tokens=512,
      do_sample=True,
      temperature=0.7,
      top_k=50,
      top_p=0.95
    )
    response = outputs[0]["generated_text"]
    
    return response.split('<|assistant|>\n')[1].replace('**SQL Query**: ', '')