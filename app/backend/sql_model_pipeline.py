"""Optional local checkpoints, loaded only when requested."""
from functools import lru_cache
import os
from pathlib import Path

from .analysis import parse_schema

BASE_DIR = Path(__file__).resolve().parent


def checkpoint(variable, default):
    path = Path(os.getenv(variable, str(BASE_DIR / default))).expanduser().resolve()
    if not path.is_dir():
        raise FileNotFoundError(f"Missing checkpoint: {variable}")
    return path


@lru_cache(maxsize=1)
def load_generator():
    path = checkpoint("T5_MODEL_PATH", "fine-tuned-t5-small-sql")
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    return AutoTokenizer.from_pretrained(path, local_files_only=True), AutoModelForSeq2SeqLM.from_pretrained(path, local_files_only=True).eval()


@lru_cache(maxsize=1)
def load_explainer():
    path = checkpoint("TINYLLAMA_MODEL_PATH", "tinyllama-sql-explainer-full")
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    from peft import PeftModel
    base = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    tokenizer = AutoTokenizer.from_pretrained(base)
    model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=torch.float32)
    model = PeftModel.from_pretrained(model, path).eval()
    return tokenizer, pipeline("text-generation", model=model, tokenizer=tokenizer, device=-1)


def generate_sql(question, context):
    import torch
    tokenizer, model = load_generator()
    inputs = tokenizer(f"question: {question} context: {context}", max_length=512, truncation=True, return_tensors="pt")
    with torch.inference_mode():
        outputs = model.generate(**inputs, max_new_tokens=128, num_beams=4, early_stopping=True)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def generate_explanation(schema, question, sql_query):
    tables = parse_schema(schema)
    summary = "\n".join(f"Table {table}: {', '.join(columns)}" for table, columns in tables.items())
    tokenizer, generator = load_explainer()
    messages = [
        {"role": "system", "content": "Explain the SQL query step by step using the supplied schema. Do not invent data or business rules."},
        {"role": "user", "content": f"Question: {question}\nSchema: {summary}\nSQL: {sql_query}"},
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return generator(prompt, max_new_tokens=512, do_sample=False, return_full_text=False)[0]["generated_text"].strip()
