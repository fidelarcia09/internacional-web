-- Set RechargeGames retail markup to 10% while preserving upward cent rounding.
DO $block$
DECLARE
  v_definition text;
BEGIN
  v_definition := pg_get_functiondef(
    'public.purchase_rechargegames_order(text,text,text,text,text,numeric)'::regprocedure
  );
  IF position('1.05' IN v_definition) = 0 THEN
    RAISE EXCEPTION 'Expected previous 5%% markup (1.05) was not found';
  END IF;
  EXECUTE replace(v_definition, '1.05', '1.10');
END
$block$;
