# Research notes

## Original question

Can structured database context make generated explanations of SQL and software behavior more useful? The class project explored query decomposition, retrieval over SQL procedures, schema knowledge graphs, and model fine-tuning.

## Source artifacts

- [Original report](../Documents/softwaredocbot_raw.tex): methodology, training descriptions, evaluation table, and discussion.
- [Agent workflow notebook](../R&D/agentic_workflow.ipynb) and [agent evaluation notebook](../R&D/test_agent.ipynb).
- [T5 training](../R&D/Finetune_T5small_Generator.ipynb) and [TinyLlama training](../R&D/Finetune_TinyLlama.ipynb).
- [Evaluation questions](../R&D/sample_questions2.json), [reference answers](../R&D/standard_qa.json), and [Groq responses](../R&D/groq_qa.json).
- [SQL graph experiments](../R&D/SQL_To_Knowledge_Graph.ipynb) and [graph pipeline tests](../R&D/Test_KG_Pipeline.ipynb).

The LaTeX source references figures and bibliography files that are not all included. It is preserved as a historical report source, not a self-contained publication build.

## Reported evaluation

The report compares simple retrieval, the event workflow without graph context, the complete workflow, and the workflow with the trained model.

| Configuration | BLEU | ROUGE-L | METEOR |
| --- | ---: | ---: | ---: |
| Simple RAG | 0.0979 | 0.2633 | 0.3211 |
| Workflow without graph | 0.1263 | 0.2750 | 0.3284 |
| Complete workflow | 0.1291 | 0.2847 | 0.3318 |
| Complete workflow with trained model | 0.4210 | 0.5407 | 0.5381 |

Source: the evaluation table in `Documents/softwaredocbot_raw.tex`, originally committed in `de26d3e`. Values are reproduced from that report, not recomputed during the portfolio refresh.

## What the results support

Within the reported experiment, adding workflow steps and schema context increased similarity to reference explanations. The trained configuration recorded the highest overlap scores.

These scores do not demonstrate that every explanation is factually correct, that hallucination is eliminated, or that the model outperforms general-purpose models on unrelated tasks. The original artifacts are not sufficient for a fully automated reproduction: the trained checkpoints are absent, provider versions may differ, and split provenance and evaluation conditions should be audited before stronger claims are made.

The portfolio demo does not run these experiments. Its prepared answers and deterministic SQL explanation path are intended to demonstrate the interaction and system structure.

## Reproduction checklist

1. Record the question set, train/evaluation separation, prompts, and reference-answer provenance.
2. Export the original checkpoints and document their model and dataset licensing.
3. Pin the full research environment and record provider/model identifiers.
4. Rebuild the corpus index with the same embedding configuration.
5. Re-run each configuration on the same held-out questions, preserving raw responses and metric scripts.
6. Add schema-grounding checks and human review of factual claims.

## Historical media

The original interface captures remain in `assets/`, alongside the architecture diagram and training plots. The original recording is tracked through Git LFS. New interface screenshots live in `docs/images/`.
