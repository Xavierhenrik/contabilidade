-- Amplia a função já criada em 20261113_public_shared_accounting.sql.
-- Não recria tabelas. Rodar no SQL Editor depois da migration inicial,
-- antes de usar a versão que grava settings e os tipos novos de lançamento.
-- Não altera dados existentes.

create or replace function public.salvar_contabilidade_compartilhada(
 p_versao_esperada bigint,
 p_dados jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
 atual public.contabilidade_compartilhada%rowtype;
 nome text;
begin
 if p_dados is null or pg_catalog.jsonb_typeof(p_dados) <> 'object'
   or pg_catalog.octet_length(p_dados::text) > 250000
   or p_dados->>'schema' <> '1'
   or p_dados->>'exercise' <> '2026'
   or pg_catalog.jsonb_typeof(p_dados->'data') <> 'object'
   or pg_catalog.jsonb_typeof(p_dados->'entries') <> 'array'
   or pg_catalog.jsonb_array_length(p_dados->'entries') > 2500
   or pg_catalog.jsonb_typeof(p_dados->'cash') not in ('string', 'number')
 then
   raise exception 'Dados invalidos ou acima do limite permitido' using errcode = '22023';
 end if;

 if p_dados->'settings' is not null
    and pg_catalog.jsonb_typeof(p_dados->'settings') <> 'object' then
   raise exception 'Configuracao invalida' using errcode = '22023';
 end if;

 foreach nome in array array['items','suppliers','customers','assets','accounts']
 loop
   if pg_catalog.jsonb_typeof(p_dados->'data'->nome) <> 'array'
     or pg_catalog.jsonb_array_length(p_dados->'data'->nome) > 1500 then
       raise exception 'Cadastro invalido: %', nome using errcode='22023';
   end if;
 end loop;

 if (p_dados->>'cash') !~ '^[0-9]{1,12}(\.[0-9]{1,2})?$' then
   raise exception 'Saldo inicial invalido' using errcode='22023';
 end if;

 if exists (
  select 1 from pg_catalog.jsonb_array_elements(p_dados->'entries') e
  where pg_catalog.jsonb_typeof(e) <> 'object'
    or e->>'kind' not in (
      'compra','venda','compra_prazo','venda_prazo',
      'pagamento','recebimento','aluguel','salario','energia','outra_despesa',
      'emprestimo','amortizacao','juros','depreciacao',
      'devolucao','pagamento_emprestimo','pagamento_encargo','dividendos',
      'reserva','integralizacao','reducao_capital','aquisicao')
    or e->>'date' !~ '^2026-[0-1][0-9]-[0-3][0-9]$'
    or e->>'id' is null
 ) then
   raise exception 'Lancamento invalido' using errcode='22023';
 end if;

 select * into atual from public.contabilidade_compartilhada where id=1 for update;
 if not found then
   raise exception 'Banco ainda nao inicializado' using errcode='P0001';
 end if;
 if atual.versao <> p_versao_esperada then
   raise exception 'CONFLITO_VERSAO' using errcode='P0001';
 end if;
 if atual.atualizado_em > pg_catalog.now() - interval '2 seconds' then
   raise exception 'LIMITE_ESCRITAS: tente novamente em alguns segundos' using errcode='P0001';
 end if;
 insert into public.contabilidade_historico(versao,dados) values(atual.versao,atual.dados);
 update public.contabilidade_compartilhada
 set dados=p_dados, versao=atual.versao+1, atualizado_em=pg_catalog.now()
 where id=1;
 return pg_catalog.jsonb_build_object('versao', atual.versao+1, 'ok', true);
end
$$;

revoke all on function public.salvar_contabilidade_compartilhada(bigint,jsonb)
 from public, anon, authenticated;
grant execute on function public.salvar_contabilidade_compartilhada(bigint,jsonb)
 to anon, authenticated;
