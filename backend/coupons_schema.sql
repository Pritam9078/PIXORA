-- Coupons Schema

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    is_gift_access BOOLEAN DEFAULT FALSE,
    max_uses INTEGER DEFAULT 0, -- 0 means unlimited
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE RESTRICT,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    discounted_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update payments table to track coupons and gift access
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS is_gift_access BOOLEAN DEFAULT FALSE;

-- Grant API access
GRANT ALL ON TABLE public.coupons TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coupon_redemptions TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for coupons
DROP POLICY IF EXISTS "Enable read access for active coupons for all users" ON public.coupons;
CREATE POLICY "Enable read access for active coupons for all users" ON public.coupons
    FOR SELECT
    USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Enable all access for admins on coupons" ON public.coupons;
CREATE POLICY "Enable all access for admins on coupons" ON public.coupons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policies for coupon_redemptions
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.coupon_redemptions;
CREATE POLICY "Enable insert for authenticated users" ON public.coupon_redemptions
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Enable read for users own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Enable read for users own redemptions" ON public.coupon_redemptions
    FOR SELECT
    USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Enable all access for admins on redemptions" ON public.coupon_redemptions;
CREATE POLICY "Enable all access for admins on redemptions" ON public.coupon_redemptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Seed initial requested coupons
INSERT INTO public.coupons (code, discount_percentage, is_gift_access, is_active)
VALUES ('PIXORA05', 50, false, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.coupons (code, discount_percentage, is_gift_access, is_active)
VALUES ('PIXORA001', 100, true, true)
ON CONFLICT (code) DO NOTHING;

-- Trigger to increment current_uses
CREATE OR REPLACE FUNCTION increment_coupon_uses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.coupons
    SET current_uses = current_uses + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_coupon_uses ON public.coupon_redemptions;
CREATE TRIGGER tr_increment_coupon_uses
AFTER INSERT ON public.coupon_redemptions
FOR EACH ROW
EXECUTE FUNCTION increment_coupon_uses();

-- Policies for payments (Fix for missing INSERT policy)
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
CREATE POLICY "Users can insert their own payments" ON public.payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
