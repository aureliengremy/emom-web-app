-- Migration: Ajouter les colonnes pour les sons de countdown
-- Date: 2026-02-07

-- Ajouter la colonne countdown_sound_pack
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS countdown_sound_pack TEXT DEFAULT 'minimal';

-- Ajouter la colonne countdown_sounds_enabled
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS countdown_sounds_enabled BOOLEAN DEFAULT true;

-- Ajouter un commentaire pour documenter les valeurs possibles
COMMENT ON COLUMN user_settings.countdown_sound_pack IS 'Pack de sons pour le countdown: minimal, sport, zen, arcade';
COMMENT ON COLUMN user_settings.countdown_sounds_enabled IS 'Active/desactive les sons du countdown (10s, 5-1s, finish)';
