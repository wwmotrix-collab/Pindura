# PicoClaw vestido como Assistente Pindura

Esta pasta transforma o PicoClaw em uma camada própria para programação, debug e futura automação de relacionamento do Pindura.

## Arquivos principais

- `config/base-replicavel.md`: regras reutilizáveis para outros projetos.
- `config/assistant-dev.md`: regras de desenvolvimento Pindura.
- `config/assistant-debug.md`: regras de debug Pindura.
- `config/assistant-relacionamento.md`: base futura para motor de relacionamento.
- `prompts/debug-pindura.md`: prompt padrão de auditoria/debug.
- `prompts/implementar-feature.md`: prompt para novas features.
- `prompts/revisar-seguranca.md`: prompt de segurança.
- `prompts/adaptar-novo-projeto.md`: prompt para replicar a base em outros projetos.
- `run-debug.sh`: inicia debug guiado.
- `run-dev.sh`: inicia assistente dev.
- `run-relacionamento.sh`: inicia camada futura de relacionamento.

## Configuração local da chave

Nunca coloque chave no repositório.

Use:

```bash
mkdir -p ~/.picoclaw
cp tools/picoclaw/templates/config.example.json ~/.picoclaw/config.json
nano ~/.picoclaw/config.json
```

Cole sua chave apenas no arquivo local `~/.picoclaw/config.json`.

## Como usar

```bash
./tools/picoclaw/run-debug.sh
```

ou:

```bash
./tools/picoclaw/run-dev.sh
```

## Regra de segurança Git

O assistente deve executar `git status` e `git diff`, mas não deve executar `git add`, `git commit` ou `git push` sem autorização explícita.
