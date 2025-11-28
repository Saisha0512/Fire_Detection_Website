-- Update alerts.alert_type check constraint to allow temperature alerts
ALTER TABLE public.alerts
  DROP CONSTRAINT IF EXISTS alerts_alert_type_check;

ALTER TABLE public.alerts
  ADD CONSTRAINT alerts_alert_type_check
  CHECK (alert_type IN ('fire', 'gas_leak', 'temperature', 'motion'));
