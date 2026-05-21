import { supabase } from '../lib/supabase';

export const CouponService = {
  /**
   * Validate a coupon code.
   * @param {string} code 
   * @returns {Promise<Object>} Coupon data if valid, otherwise throws an error.
   */
  async validateCoupon(code) {
    if (!code) {
      throw new Error('Please enter a coupon code.');
    }

    try {
      // Clean input
      const cleanCode = code.trim().toUpperCase();

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid or inactive coupon code.');
      }

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This coupon code has expired.');
      }

      // Check max uses
      if (data.max_uses > 0 && data.current_uses >= data.max_uses) {
        throw new Error('This coupon code has reached its usage limit.');
      }

      return data;
    } catch (err) {
      console.error('Coupon validation error:', err);
      throw err;
    }
  },

  /**
   * Record a coupon redemption.
   * @param {string} couponId 
   * @param {string} studentId 
   * @param {number} originalAmount 
   * @param {number} discountedAmount 
   */
  async recordRedemption(couponId, studentId, originalAmount, discountedAmount) {
    try {
      // Insert redemption record
      const { error: insertError } = await supabase
        .from('coupon_redemptions')
        .insert({
          coupon_id: couponId,
          student_id: studentId,
          original_amount: originalAmount,
          discounted_amount: discountedAmount
        });

      if (insertError) throw insertError;

      // The increment of current_uses should ideally be done via a Postgres RPC function 
      // or edge function to avoid race conditions. Since we are doing it client-side for now,
      // we just increment it. But in a production app, use an RPC.
      // For simplicity here, we'll assume the trigger handles it, or we do a simple update if RPC isn't available.
      // Easiest is to let a DB trigger do it. I'll add a trigger to the SQL file.

    } catch (err) {
      console.error('Failed to record coupon redemption:', err);
      // We don't throw to prevent blocking the checkout if this non-critical step fails
    }
  }
};
