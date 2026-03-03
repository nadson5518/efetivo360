# Plano de conclusão do painel do líder

## Situação atual
No estado atual do projeto, o painel do líder já permite:
- lançar produção;
- lançar RDC;
- consultar histórico.

As demais telas do painel ainda estão majoritariamente estáticas (sem integração completa com API e persistência no banco JSON).

## O que falta para concluir o painel

### 1) Gestão de equipe (Gerenciar Equipe + Transferir Colaboradores)
- Criar endpoints para listar colaboradores da equipe do líder e colaboradores disponíveis.
- Criar endpoint para transferência (`PATCH`/`POST`) alterando `liderId` do colaborador.
- Conectar `gerenciar-colaboradores.html` e `transferir-colaboradores.html` com scripts JS.
- Registrar as movimentações no `historico`.

**Critério de aceite**
- Líder consegue adicionar/remover colaborador da equipe e mudança permanece após recarregar.

### 2) Grupos de atividades
- Criar endpoints para CRUD de grupos do líder (`/grupos`).
- Persistir membros do grupo e status da atividade (aberta/finalizada).
- Integrar `gerenciar-grupos.html` com JS para editar colaboradores e finalizar atividade.

**Critério de aceite**
- Grupo criado/atualizado/finalizado aparece corretamente ao reabrir a página.

### 3) Metas
- Criar coleção `metas` no banco.
- Criar endpoints para cadastrar, listar e atualizar metas por período/disciplina.
- Integrar `gerenciar-metas.html` com formulário e renderização dinâmica.

**Critério de aceite**
- Líder consegue registrar meta e visualizar progresso com dados reais.

### 4) Solicitações e ajuste de horário
- Definir modelo único de solicitação (`tipo`, `dataReferencia`, `descricao`, `status`, `respostaAdm`).
- Criar endpoints para criar/listar solicitações do líder.
- Integrar `solicitacoes.html` e `solicitar-ajuste-horario.html` para envio real.

**Critério de aceite**
- Solicitação enviada pelo líder aparece em “Minhas solicitações” com status persistido.

### 5) Regras de perfil e segurança mínima
- Validar perfil para cada endpoint do painel do líder.
- Impedir acesso indevido de colaborador/ADM aos endpoints de líder quando não aplicável.

**Critério de aceite**
- Requisições com perfil incorreto retornam `403`.

### 6) Qualidade e validação funcional
- Adicionar testes de integração para rotas críticas (produção, RDC, metas, solicitações, equipe).
- Criar checklist de smoke test para navegação completa do painel.

**Critério de aceite**
- Fluxo principal do líder validado ponta a ponta sem erro no console e com persistência no banco.

## Ordem sugerida de implementação
1. Gestão de equipe
2. Grupos
3. Metas
4. Solicitações
5. Regras de perfil
6. Testes

## Entregável final esperado
Ao concluir os itens acima, todas as opções do painel do líder estarão funcionais com:
- navegação;
- integração com API;
- persistência no banco;
- histórico de ações;
- validação de perfil.
