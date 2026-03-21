// skinTips.js — Personalized Skincare Routine
// 36 unique combinations: 3 skin types × 4 age groups × 3 genders
// Format: Step name + tip + warning

// ── Helper: convert age number to group ──────────────────
export const getAgeGroup = (age) => {
  const n = parseInt(age)
  if (n <= 19) return 'teen'
  if (n <= 29) return 'young'
  if (n <= 44) return 'adult'
  return 'mature'
}

// ── Helper: get personalized tips ────────────────────────
export const getPersonalizedTips = (skinType, age, gender) => {
  const ageGroup = getAgeGroup(age)
  const key = `${skinType}_${ageGroup}_${gender}`
  return SKIN_TIPS[key] || SKIN_TIPS[`${skinType}_young_other`]
}

// ════════════════════════════════════════════════════════════
// TIPS DATABASE — 36 Unique Combinations
// ════════════════════════════════════════════════════════════

const SKIN_TIPS = {

  // ══════════════════════════════════════════════════════════
  // OILY SKIN
  // ══════════════════════════════════════════════════════════

  // ── Oily + Teen ───────────────────────────────────────────
  oily_teen_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle foaming face wash twice daily. Apply in small circular motions and rinse with cool water.', warning: 'Avoid washing more than twice — over-cleansing triggers more oil production.' },
    { step: 'Step 2 — Tone', tip: 'Apply an alcohol-free toner with a cotton pad focusing on the T-zone (forehead, nose, chin).', warning: 'Skip toners with alcohol — they dry out skin and worsen hormonal breakouts.' },
    { step: 'Step 3 — Treat', tip: 'Apply a thin layer of salicylic acid (BHA) serum on acne-prone areas. Use only at night.', warning: 'Do not use on broken skin or active wounds. Start with 2–3 times per week only.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a lightweight oil-free gel moisturizer. Use a pea-sized amount — do not skip even if skin feels oily.', warning: 'Skipping moisturizer signals skin to produce more oil. Always moisturize.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 30+ oil-free sunscreen every morning as the last step, even on cloudy days.', warning: 'Never skip sunscreen — UV exposure worsens acne scars and pigmentation in teens.' },
  ],

  oily_teen_male: [
    { step: 'Step 1 — Cleanse', tip: 'Wash face with a foaming gel cleanser morning and after sports or sweating. Focus on nose and forehead.', warning: 'Avoid bar soap on face — it disrupts skin pH and worsens oil production.' },
    { step: 'Step 2 — Tone', tip: 'Use a niacinamide toner to control oil and reduce enlarged pores. Apply with hands, not cotton.', warning: 'Avoid astringent toners — they irritate young skin and increase breakouts.' },
    { step: 'Step 3 — Treat', tip: 'Apply benzoyl peroxide spot treatment on active pimples only. Leave on overnight.', warning: 'Benzoyl peroxide bleaches fabric. Use white pillowcases and towels only.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a light water-based moisturizer. Apply to slightly damp skin for better absorption.', warning: 'Do not use thick creams or petroleum-based products — they clog pores on oily skin.' },
    { step: 'Step 5 — Protect', tip: 'Use a mattifying SPF 30+ sunscreen every morning. Reapply after 2 hours outdoors.', warning: 'Skipping SPF leads to post-acne dark marks that take months to fade.' },
  ],

  oily_teen_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle pH-balanced foaming cleanser twice daily. Lukewarm water works best.', warning: 'Hot water strips natural oils and causes rebound oiliness — always use cool or lukewarm water.' },
    { step: 'Step 2 — Tone', tip: 'Apply a calming toner with niacinamide or green tea extract to reduce redness and oil.', warning: 'Avoid fragranced toners — they cause irritation especially on sensitive teen skin.' },
    { step: 'Step 3 — Treat', tip: 'Use a gentle AHA/BHA exfoliating serum twice a week at night to unclog pores.', warning: 'Never over-exfoliate — more than 3 times per week damages the skin barrier.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a light non-comedogenic moisturizer morning and night regardless of oiliness.', warning: 'Dehydrated oily skin looks worse — hydration and oiliness are different things.' },
    { step: 'Step 5 — Protect', tip: 'Use a broad-spectrum SPF 30+ sunscreen daily. Mineral sunscreens work well for oily skin.', warning: 'Chemical sunscreens can clog pores on acne-prone skin. Prefer mineral/zinc options.' },
  ],

  // ── Oily + Young ──────────────────────────────────────────
  oily_young_female: [
    { step: 'Step 1 — Cleanse', tip: 'Double cleanse at night: micellar water first, then foaming cleanser. Morning use cleanser only.', warning: 'Avoid makeup wipes as the first step — they push dirt deeper into pores.' },
    { step: 'Step 2 — Tone', tip: 'Apply a niacinamide toner to control sebum production and fade post-acne marks.', warning: 'Do not mix niacinamide with vitamin C in the same routine — they reduce each other\'s effectiveness.' },
    { step: 'Step 3 — Treat', tip: 'Use a niacinamide or retinol serum at night. Start retinol once a week and increase gradually.', warning: 'Retinol causes sun sensitivity. Always use SPF the next morning without fail.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a lightweight hyaluronic acid gel moisturizer. Focus on cheeks which tend to be drier.', warning: 'Avoid heavy night creams — oily skin still needs light hydration, not thick occlusive creams.' },
    { step: 'Step 5 — Protect', tip: 'Apply a mattifying or tinted SPF 30–50 sunscreen. This can replace foundation on lighter days.', warning: 'Hormonal changes in your 20s worsen acne — never sleep with sunscreen or makeup on.' },
  ],

  oily_young_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a foaming cleanser with salicylic acid morning and night. Works well post-workout too.', warning: 'Avoid scrubbing too hard — physical over-exfoliation spreads bacteria and causes more breakouts.' },
    { step: 'Step 2 — Tone', tip: 'Apply an oil-controlling toner with witch hazel or niacinamide after cleansing.', warning: 'Witch hazel with alcohol is too harsh for daily use — choose the alcohol-free version.' },
    { step: 'Step 3 — Treat', tip: 'Use a retinol or niacinamide serum 3–4 nights per week to control oil and improve texture.', warning: 'Retinol should not be used daily at first — build tolerance slowly over 2–4 weeks.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a lightweight water-gel moisturizer. If you have a beard, use a separate beard moisturizer.', warning: 'Beard skin is different from facial skin — using the same product on both can cause irritation.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 30+ daily — a moisturizer with SPF works great to simplify your routine.', warning: 'Men statistically develop more skin cancer due to skipping SPF. Make it non-negotiable.' },
  ],

  oily_young_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a balanced foaming cleanser twice daily. Always cleanse after wearing makeup or being outdoors.', warning: 'Do not use body wash or shampoo on your face — the pH is too high and clogs pores.' },
    { step: 'Step 2 — Tone', tip: 'Apply a pore-refining toner with niacinamide or zinc to manage oil and enlarged pores.', warning: 'Avoid over-toning — once daily is enough. More frequent use disrupts the skin barrier.' },
    { step: 'Step 3 — Treat', tip: 'Use a gentle AHA serum (glycolic or lactic acid) twice a week to smooth skin texture.', warning: 'Acids increase sun sensitivity significantly. Always wear SPF the next morning.' },
    { step: 'Step 4 — Moisturize', tip: 'Choose a non-comedogenic gel moisturizer with hyaluronic acid for hydration without grease.', warning: 'Oil-free does not mean hydration-free. Your skin still needs water-based moisture daily.' },
    { step: 'Step 5 — Protect', tip: 'Apply broad-spectrum SPF 30+ every morning as the final step of your morning routine.', warning: 'Reapply SPF every 2 hours when outdoors — one morning application is not enough.' },
  ],

  // ── Oily + Adult ──────────────────────────────────────────
  oily_adult_female: [
    { step: 'Step 1 — Cleanse', tip: 'Double cleanse every evening. Use an oil cleanser first to dissolve SPF and makeup, then foaming cleanser.', warning: 'Oil cleansers are fine for oily skin — they do not make oiliness worse when rinsed properly.' },
    { step: 'Step 2 — Tone', tip: 'Use a BHA toner (salicylic acid) 3 times per week to keep pores clear and prevent congestion.', warning: 'Do not use BHA daily if your skin becomes dry or sensitive — reduce frequency first.' },
    { step: 'Step 3 — Treat', tip: 'Apply a vitamin C serum in the morning to fight pigmentation and early signs of aging.', warning: 'Vitamin C is unstable in light. Store it in a dark cool place and discard if it turns orange.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a lightweight moisturizer with niacinamide to balance oil and support the skin barrier.', warning: 'Skin in your 30s starts losing collagen. Do not skip moisturizer even on very oily days.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 every morning. Consider a tinted sunscreen to even skin tone without heavy makeup.', warning: 'Hormonal acne is common in your 30s. Picking or squeezing worsens pigmentation significantly.' },
  ],

  oily_adult_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gel cleanser with salicylic acid in the morning. At night, add a second cleanse after shaving.', warning: 'Shaving disrupts skin barrier. Avoid active acids immediately after shaving.' },
    { step: 'Step 2 — Tone', tip: 'Apply an exfoliating toner with BHA after cleansing to prevent ingrown hairs and clogged pores.', warning: 'Do not apply BHA on freshly shaved skin — it causes intense burning and irritation.' },
    { step: 'Step 3 — Treat', tip: 'Use a retinol serum 3–4 nights per week for anti-aging and oil control simultaneously.', warning: 'Skin in 30s is repairing slower. Do not overload with too many active ingredients at once.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a gel-cream moisturizer that also works as an aftershave balm to simplify your routine.', warning: 'Alcohol-based aftershaves over-dry the skin and worsen oiliness over time.' },
    { step: 'Step 5 — Protect', tip: 'Use an SPF 30–50 moisturizer daily. Combine with a hat when outdoors for full protection.', warning: 'UV damage is cumulative and irreversible. Men are more likely to develop melanoma than women.' },
  ],

  oily_adult_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a foaming cleanser with salicylic acid morning and night to keep pores clear consistently.', warning: 'Switching cleansers frequently disrupts skin microbiome. Stick with one for at least 4 weeks.' },
    { step: 'Step 2 — Tone', tip: 'Apply a niacinamide toner to regulate oil production and minimize the appearance of pores.', warning: 'Niacinamide is very well tolerated but avoid using more than 10% concentration.' },
    { step: 'Step 3 — Treat', tip: 'Introduce a retinol serum into your evening routine for anti-aging and skin texture improvement.', warning: 'Retinol causes purging in the first 4–6 weeks — this is normal. Do not stop too early.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a hyaluronic acid gel moisturizer to provide deep hydration without adding oil.', warning: 'Apply hyaluronic acid on damp skin for best absorption — it draws moisture from the environment.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 broad-spectrum sunscreen every morning without exception.', warning: 'In your 30s sun damage becomes more visible. Consistent SPF is your best anti-aging tool.' },
  ],

  // ── Oily + Mature ─────────────────────────────────────────
  oily_mature_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a hydrating gel cleanser that cleanses without stripping. Skin becomes drier with age even if oily.', warning: 'Foaming cleansers that feel squeaky clean are too harsh for skin over 45 — they damage the barrier.' },
    { step: 'Step 2 — Tone', tip: 'Use a gentle toner with antioxidants like green tea or resveratrol to fight free radical damage.', warning: 'Avoid high-acid toners daily — skin cell turnover slows with age and acids can over-sensitize.' },
    { step: 'Step 3 — Treat', tip: 'Apply a retinol serum every night starting with low strength (0.025%). Increase concentration slowly.', warning: 'Mature skin is thinner — retinol irritation is more pronounced. Always use the lowest strength first.' },
    { step: 'Step 4 — Moisturize', tip: 'Layer a hyaluronic acid serum under a nourishing cream moisturizer for deep plumping hydration.', warning: 'Even oily mature skin needs richer moisturizer than in younger years — do not use only gel formulas.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 50+ every morning and reapply midday. Use an antioxidant serum underneath for extra protection.', warning: 'Menopause dramatically increases skin cancer risk — SPF 50 is non-negotiable after 45.' },
  ],

  oily_mature_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a mild cream or gel cleanser. Skin still produces oil but also loses moisture faster after 45.', warning: 'Harsh cleansers accelerate skin thinning in older men — choose fragrance-free gentle formulas.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with hyaluronic acid and peptides to support skin elasticity.', warning: 'Avoid astringent toners completely after 45 — they remove moisture your skin can no longer replace easily.' },
    { step: 'Step 3 — Treat', tip: 'Use a retinol or peptide serum to address deep wrinkles and loss of firmness. Apply every other night.', warning: 'Mature male skin is thicker but repairs more slowly. Do not skip recovery nights between retinol use.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich moisturizer with ceramides and peptides. Apply to neck and jawline too, not just face.', warning: 'Neglecting the neck is the most common skincare mistake in older men — it ages faster than the face.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50+ daily. Wear a hat and protective clothing when outdoors for extended time.', warning: 'Sun damage done in youth becomes visible after 45. Daily SPF is the only proven way to slow it.' },
  ],

  oily_mature_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle non-foaming cleanser that preserves the skin barrier. Cleanse once at night, rinse only in morning.', warning: 'Over-cleansing after 45 accelerates moisture loss. Morning rinse with water is often enough.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with ceramides or peptides to restore the aging skin barrier.', warning: 'Alcohol-based toners are extremely damaging for mature skin — always check the ingredients list.' },
    { step: 'Step 3 — Treat', tip: 'Use growth factor or peptide serum to stimulate collagen production and improve skin firmness.', warning: 'Results from peptides take 8–12 weeks. Do not change products too frequently — give them time.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich barrier-repairing moisturizer with ceramides, niacinamide, and hyaluronic acid.', warning: 'Skin after 45 loses 30% of its collagen. Rich moisturizers help preserve what remains.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50+ every morning is mandatory. Apply to face, neck, hands, and any exposed skin.', warning: 'Hands and neck are the first areas to show age-related sun damage — do not forget them.' },
  ],

  // ══════════════════════════════════════════════════════════
  // DRY SKIN
  // ══════════════════════════════════════════════════════════

  dry_teen_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a creamy or milk cleanser once at night. In the morning just rinse with lukewarm water.', warning: 'Foaming cleansers strip natural oils from dry skin — avoid them completely.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with rose water or glycerin. Pat gently onto skin, do not rub.', warning: 'Never use toners with alcohol or witch hazel on dry skin — they cause flaking and irritation.' },
    { step: 'Step 3 — Treat', tip: 'Apply a hyaluronic acid serum on damp skin immediately after toning for maximum moisture absorption.', warning: 'Hyaluronic acid on dry skin in low humidity can actually dehydrate — always follow with moisturizer.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a rich cream moisturizer morning and night. Focus on cheeks and around eyes which dry out fastest.', warning: 'Do not use thin lotions on dry skin — they evaporate too quickly and provide no lasting hydration.' },
    { step: 'Step 5 — Protect', tip: 'Choose a hydrating SPF 30+ with ingredients like glycerin or ceramides for sun protection.', warning: 'Dry skin burns more easily. Matte sunscreens further dry the skin — always choose hydrating formulas.' },
  ],

  dry_teen_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle soap-free cleanser once daily at night. Pat face dry with a soft towel — never rub.', warning: 'Hot showers are very damaging for dry skin — always use lukewarm water on your face.' },
    { step: 'Step 2 — Tone', tip: 'Use a simple hydrating toner with glycerin. Apply with hands by pressing gently into skin.', warning: 'Skip toner entirely if your skin feels tight after — some dry skin types don\'t need it.' },
    { step: 'Step 3 — Treat', tip: 'Apply a few drops of squalane oil or a hydrating serum before moisturizer to lock in moisture.', warning: 'Oils should go before heavy creams, not after — creams seal in the oil for better effect.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a thick cream moisturizer with shea butter or ceramides twice daily. Apply on slightly damp skin.', warning: 'If your skin is still dry after moisturizing, try applying moisturizer within 60 seconds of washing.' },
    { step: 'Step 5 — Protect', tip: 'Use a moisturizing SPF 30+ sunscreen. A combined SPF moisturizer simplifies dry skin routine.', warning: 'Dry skin cracks in the sun more easily. Do not skip SPF even in winter months.' },
  ],

  dry_teen_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle milk or balm cleanser once at night. In the morning rinse with cool water only.', warning: 'Double cleansing is not needed for dry skin — it removes too many natural protective oils.' },
    { step: 'Step 2 — Tone', tip: 'Apply a soothing toner with aloe vera or glycerin to calm and prepare skin for moisturizer.', warning: 'Exfoliating toners should be used maximum once per week on dry skin — not more.' },
    { step: 'Step 3 — Treat', tip: 'Apply a nourishing serum with vitamin E or B5 (panthenol) to repair the skin barrier.', warning: 'Avoid vitamin C serums on dry sensitive skin without building tolerance first — they can sting.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a thick cream moisturizer while skin is still slightly damp. Layer a thin face oil on top.', warning: 'Skipping moisturizer even once causes dry skin to flake and crack — consistency is key.' },
    { step: 'Step 5 — Protect', tip: 'Use a hydrating mineral sunscreen SPF 30+. Apply generously and evenly every morning.', warning: 'Dry skin shows UV damage faster. SPF is the most effective anti-aging step you can take.' },
  ],

  dry_young_female: [
    { step: 'Step 1 — Cleanse', tip: 'Cleanse at night with a hydrating cleanser. Add a micellar water step before if wearing makeup.', warning: 'Avoid gel or foaming cleansers entirely — they strip the very oils dry skin depends on.' },
    { step: 'Step 2 — Tone', tip: 'Layer a hydrating toner first, then an essence for double hydration before your serum.', warning: 'Exfoliating acids should be used carefully on dry skin — maximum 1–2 times per week only.' },
    { step: 'Step 3 — Treat', tip: 'Apply hyaluronic acid serum followed by a ceramide serum to deeply hydrate and repair the barrier.', warning: 'Using too many active serums at once irritates dry skin — introduce one at a time over 2 weeks.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich cream with ceramides, shea butter, and peptides morning and night. Apply to neck too.', warning: 'Dry skin in your 20s needs richer products than you might expect — light lotions are not enough.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 with a moisturizing formula. Dewy finish sunscreens work beautifully on dry skin.', warning: 'Dry skin shows fine lines earlier — consistent SPF and moisture prevents premature aging.' },
  ],

  dry_young_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle cream cleanser once at night. Use a splash of cool water in the morning only.', warning: 'Morning cleansing is often too harsh for dry skin. Water rinse is sufficient in most cases.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with glycerin. Keep it simple — one toner is enough.', warning: 'Astringent toners are the worst choice for dry skin. Check ingredients before buying.' },
    { step: 'Step 3 — Treat', tip: 'Apply a rich vitamin E or squalane serum after toning to nourish and repair the skin barrier.', warning: 'Do not layer too many serums — dry skin gets overwhelmed easily and may react negatively.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a thick balm-type moisturizer at night. Use a lighter cream during the day to avoid shine.', warning: 'If using an aftershave, choose a balm not a lotion — balms hydrate while lotions can dry further.' },
    { step: 'Step 5 — Protect', tip: 'Use a moisturizing SPF 30+ sunscreen that doubles as a hydrating base layer.', warning: 'Dry skin is more vulnerable to UV damage — SPF 30 is the minimum acceptable protection.' },
  ],

  dry_young_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle balm or oil cleanser that transforms to milk when rinsed. Perfect for dry skin types.', warning: 'Hot water opens pores but also strips moisture. Always rinse with lukewarm water.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with multiple humectants like glycerin, aloe, and hyaluronic acid.', warning: 'Do not skip toner if your skin feels tight after cleansing — it restores hydration balance.' },
    { step: 'Step 3 — Treat', tip: 'Apply a ceramide or barrier-repair serum to strengthen and protect the skin from moisture loss.', warning: 'Niacinamide at high concentration can cause flushing on dry sensitive skin — start with 5% max.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich ceramide cream. In winter add a drop of facial oil on top for extra barrier protection.', warning: 'Central heating and air conditioning severely dehydrate dry skin. Use a humidifier if possible.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 30+ hydrating sunscreen as the last step every single morning without exception.', warning: 'Forgetting SPF on dry skin accelerates fine line formation. Make it part of your morning habit.' },
  ],

  dry_adult_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use an oil or balm cleanser every night. In the morning use thermal spring water spray instead of washing.', warning: 'Dry skin in your 30s is more fragile — washing twice daily accelerates moisture loss significantly.' },
    { step: 'Step 2 — Tone', tip: 'Layer two hydrating toners using the 7-skin method: press thin layers repeatedly for intense hydration.', warning: 'Do not rush the toner step — each layer needs 30 seconds to absorb before applying the next.' },
    { step: 'Step 3 — Treat', tip: 'Apply vitamin C serum in the morning for brightening. Use peptide serum at night for collagen support.', warning: 'Retinol is harsh on dry skin — use it maximum twice per week and always follow with rich moisturizer.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich night cream with retinol and peptides at night. Use SPF moisturizer in the morning.', warning: 'Skin loses collagen at 1% per year after 30. Rich moisturizers help preserve elasticity.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 with antioxidants (vitamin C or E) for double protection against UV and free radicals.', warning: 'In your 30s UV damage becomes permanent quickly. SPF is your most powerful anti-aging product.' },
  ],

  dry_adult_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle cream cleanser at night. Apply shaving oil before shaving to protect dry skin during the process.', warning: 'Dry shaving on dry skin causes micro-tears and inflammation — always use a barrier product.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner with hyaluronic acid to immediately rehydrate skin after cleansing.', warning: 'Do not use aftershave with alcohol on dry skin. It evaporates fast and leaves skin more dehydrated.' },
    { step: 'Step 3 — Treat', tip: 'Apply a peptide or growth factor serum to address fine lines and loss of firmness in your 30s.', warning: 'Results from anti-aging serums take 8–12 weeks minimum. Do not give up too soon.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich balm-cream moisturizer. Apply to face, neck, and the back of hands every morning and night.', warning: 'Male skin is thicker but loses moisture faster. Rich moisturizer is not optional for dry skin types.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 30–50 daily. Wear a hat when outdoors for more than 30 minutes.', warning: 'Men are 2× more likely than women to develop skin cancer. Daily SPF literally saves lives.' },
  ],

  dry_adult_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle balm cleanser that nourishes while cleansing. Avoid rinsing with anything colder than lukewarm.', warning: 'Cold water closes pores but does not help dry skin — lukewarm is always the best temperature.' },
    { step: 'Step 2 — Tone', tip: 'Apply a deeply hydrating essence or toner as first step while skin is still slightly damp from cleansing.', warning: 'If your skin is red or reactive, patch test every new toner on your neck for 48 hours first.' },
    { step: 'Step 3 — Treat', tip: 'Use a ceramide-rich serum to rebuild the skin barrier and prevent transepidermal water loss.', warning: 'Skin barrier damage takes 4–6 weeks to repair. Be patient and avoid harsh products during this time.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a rich moisturizer morning and night. Consider a sleeping mask 2–3 nights per week for extra repair.', warning: 'Sleeping masks should not replace your regular moisturizer — use both for best results.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 daily. Antioxidant serums underneath boost protection by neutralizing free radicals.', warning: 'Dry skin sunburns faster than oily skin. Never go outdoors in daylight without sun protection.' },
  ],

  dry_mature_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a rich cleansing balm or oil that leaves a thin protective film on skin. Do not rinse completely dry.', warning: 'Fully stripping cleansers are damaging for mature dry skin — moisture loss is rapid and hard to reverse.' },
    { step: 'Step 2 — Tone', tip: 'Apply a deeply hydrating essence with hyaluronic acid, ceramides, and peptides for plumping effect.', warning: 'Avoid any exfoliating acids at this stage unless recommended by a dermatologist for your specific skin.' },
    { step: 'Step 3 — Treat', tip: 'Apply a rich peptide or growth factor serum to stimulate collagen and deeply nourish thinning skin.', warning: 'Mature dry skin is very thin. Aggressive active ingredients cause more harm than benefit. Go gentle.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a deeply nourishing cream with ceramides, squalane, and peptides. Apply to face, neck, and décolletage.', warning: 'Neck and décolletage have very few oil glands and dry out fastest. They need dedicated moisturizing.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50+ with antioxidants every morning. Reapply every 2 hours when outdoors.', warning: 'Post-menopausal skin is extremely vulnerable to UV damage. SPF 50+ is not optional — it is essential.' },
  ],

  dry_mature_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a rich cleansing milk or oil cleanser once at night. Morning rinse only with lukewarm water.', warning: 'Over-cleansing mature dry skin removes the limited sebum it produces and causes severe dehydration.' },
    { step: 'Step 2 — Tone', tip: 'Apply a rich hydrating toner or facial mist with ceramides and hyaluronic acid.', warning: 'At this stage, irritating or acidic toners cause more harm than benefit. Keep toning very gentle.' },
    { step: 'Step 3 — Treat', tip: 'Apply a nourishing face oil like argan or rosehip before moisturizer for deep nourishment.', warning: 'Some face oils can irritate around the eye area — avoid applying too close to eyes.' },
    { step: 'Step 4 — Moisturize', tip: 'Use the richest moisturizer you can find with ceramides, peptides, and squalane. Apply generously.', warning: 'Mature male skin thins by up to 15% after 60. Rich moisturizer is one of the best anti-aging tools.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50+ every morning on face, neck, and hands. These are the most sun-exposed areas.', warning: 'Skin cancer rates double every decade after 40 in men. SPF is genuinely life-saving at this age.' },
  ],

  dry_mature_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a nourishing cleansing oil or milk cleanser. Rinse gently and immediately apply toner while skin is damp.', warning: 'Waiting too long after cleansing causes moisture to evaporate from dry mature skin. Move fast.' },
    { step: 'Step 2 — Tone', tip: 'Apply a very rich hydrating toner by pressing it into skin with palms, not patting with cotton.', warning: 'Cotton pads absorb and waste expensive toner. Hands are better for applying to dry mature skin.' },
    { step: 'Step 3 — Treat', tip: 'Apply a deeply nourishing serum with peptides, plant stem cells, or growth factors for mature skin repair.', warning: 'Choose serums specifically formulated for mature skin — those for young skin often lack the richness needed.' },
    { step: 'Step 4 — Moisturize', tip: 'Use the richest possible cream. Apply a sleeping mask over it 3 nights per week for intensive repair.', warning: 'Mature dry skin can handle and needs the richest products available. Do not hold back.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 50+ daily as a non-negotiable final step every single morning of the year.', warning: 'Even on overcast days UV radiation reaches skin. Clouds block heat but not UV rays.' },
  ],

  // ══════════════════════════════════════════════════════════
  // NORMAL SKIN
  // ══════════════════════════════════════════════════════════

  normal_teen_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle balanced cleanser once at night. Morning rinse with cool water to preserve natural oils.', warning: 'Normal skin can become oily or dry if over-cleansed. Twice daily washing is enough, no more.' },
    { step: 'Step 2 — Tone', tip: 'Apply a simple hydrating toner with rose water or aloe vera to refresh and balance skin pH.', warning: 'Normal skin does not need strong toners. Anything with high alcohol content will upset the balance.' },
    { step: 'Step 3 — Treat', tip: 'Use a vitamin C serum in the morning for glow and protection against early environmental damage.', warning: 'Vitamin C can make skin more sensitive to sun. Always wear SPF on days you use it.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a light balanced moisturizer morning and night. A gel-cream formula works best for normal skin.', warning: 'Too heavy a moisturizer will make normal skin congested. Stay with medium-weight formulas.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 30+ sunscreen every morning as the final step. Use a formula that feels comfortable daily.', warning: 'Normal skin in teens is the ideal time to build good SPF habits. UV damage is cumulative from early.' },
  ],

  normal_teen_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a mild gel cleanser once or twice daily. Keep it simple — normal skin does not need complicated cleansing.', warning: 'Normal skin can turn oily easily during puberty. Avoid over-moisturizing or using heavy products.' },
    { step: 'Step 2 — Tone', tip: 'Use a balancing toner with niacinamide or green tea extract to maintain good skin health.', warning: 'Skipping toner is fine for normal skin. It is optional — do not stress if you forget.' },
    { step: 'Step 3 — Treat', tip: 'Apply a light niacinamide serum to maintain clear even skin and prevent future breakouts.', warning: 'Using too many active ingredients on normal skin creates problems that were not there before.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a lightweight gel moisturizer morning and night. Normal skin needs less moisturizer than other types.', warning: 'Heavy creams on normal teen skin causes breakouts. Keep products lightweight.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 30+ daily. A lightweight gel sunscreen works best for daily use in teens.', warning: 'Starting SPF early is the single best thing you can do for your skin long-term. Start now.' },
  ],

  normal_teen_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle balanced cleanser once daily at night. Rinse with water only in the morning.', warning: 'Normal skin is balanced by nature. Aggressive products disrupt this balance permanently over time.' },
    { step: 'Step 2 — Tone', tip: 'Use a light hydrating toner. This step is optional for normal skin but keeps it looking fresh.', warning: 'Do not use toners that claim to tighten pores aggressively — they damage the skin barrier.' },
    { step: 'Step 3 — Treat', tip: 'Apply a gentle antioxidant serum with vitamin C or E a few times per week to maintain skin health.', warning: 'Focus on maintaining good skin rather than treating problems you do not yet have.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a medium-weight moisturizer morning and night. You need less product than other skin types.', warning: 'Over-moisturizing normal skin leads to congestion. Use less than you think you need.' },
    { step: 'Step 5 — Protect', tip: 'Apply broad-spectrum SPF 30+ every morning. This is the most important step at any age.', warning: 'Normal skin is not immune to sun damage. UV damage shows up years later. Protect now.' },
  ],

  normal_young_female: [
    { step: 'Step 1 — Cleanse', tip: 'Double cleanse at night if wearing SPF or makeup. Use a gentle cleanser in the morning.', warning: 'Over-cleansing in your 20s causes early dryness and fine lines. Be gentle even with normal skin.' },
    { step: 'Step 2 — Tone', tip: 'Use a hydrating toner with antioxidants like vitamin C or niacinamide to maintain radiance.', warning: 'Normal skin does not need heavy exfoliating toners. Save strong acids for occasional use only.' },
    { step: 'Step 3 — Treat', tip: 'Apply vitamin C serum in the morning. Use a gentle retinol serum twice per week at night.', warning: 'Starting retinol in your 20s is proactive and smart. But start low (0.025%) and build up slowly.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a balanced gel-cream moisturizer morning and night. Add eye cream to protect the delicate eye area.', warning: 'The eye area has no oil glands. It needs dedicated eye cream from your 20s onward.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 every single morning. Your 20s set the foundation for how your skin looks at 40.', warning: 'Normal skin without SPF in your 20s develops pigmentation and fine lines noticeably by 30.' },
  ],

  normal_young_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a balanced gel cleanser morning and night. After the gym is a good third cleanse if needed.', warning: 'Sweat mixed with SPF and pollution clogs pores. Always cleanse after heavy sweating.' },
    { step: 'Step 2 — Tone', tip: 'Apply a niacinamide or antioxidant toner to keep skin clear and prepare it for serums.', warning: 'Toning is optional for normal skin. If your skin looks fine without it, skip it.' },
    { step: 'Step 3 — Treat', tip: 'Use a vitamin C serum in the morning for environmental protection and a clear even complexion.', warning: 'Normal skin is easy to maintain but easy to take for granted. Consistent routine beats irregular intensive care.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a lightweight moisturizer with SPF for the morning. Use a slightly richer one at night.', warning: 'Never use body lotion on the face — face skin is thinner and reacts differently to ingredients.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 30–50 daily without fail. A moisturizer with SPF simplifies the morning routine.', warning: 'Men with normal skin often skip skincare thinking they don\'t need it. UV damage doesn\'t discriminate.' },
  ],

  normal_young_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle balanced cleanser once or twice daily. Keep the routine minimal and consistent.', warning: 'Resist the temptation to try every new product on normal skin. Consistency beats variety.' },
    { step: 'Step 2 — Tone', tip: 'Apply a balancing toner with antioxidants. Optional step but beneficial for maintaining good skin.', warning: 'Normal skin can shift towards oily or dry with stress, diet, or seasonal changes. Adjust accordingly.' },
    { step: 'Step 3 — Treat', tip: 'Use a vitamin C or niacinamide serum to maintain brightness and prevent early signs of aging.', warning: 'Your 20s are the best time to invest in prevention. Treat before problems appear.' },
    { step: 'Step 4 — Moisturize', tip: 'Apply a gel-cream moisturizer morning and night. The right amount is less than you think.', warning: 'Too much moisturizer on normal skin creates a greasy film and attracts pollutants. Use sparingly.' },
    { step: 'Step 5 — Protect', tip: 'Apply SPF 50 every morning. This one step does more for skin aging than any other product.', warning: 'Sunscreen is the only proven anti-aging product. Everything else is secondary.' },
  ],

  normal_adult_female: [
    { step: 'Step 1 — Cleanse', tip: 'Double cleanse at night. Invest in a good cleansing balm to remove SPF and prevent clogging in your 30s.', warning: 'Skin cell turnover slows after 30. Cleansing properly prevents dullness and congestion.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner followed by an exfoliating toner (AHA) twice per week at night.', warning: 'Exfoliating acids on normal skin twice per week is plenty. More causes sensitivity and redness.' },
    { step: 'Step 3 — Treat', tip: 'Use retinol 2–3 nights per week and vitamin C every morning for anti-aging and brightening.', warning: 'Do not use retinol and vitamin C in the same routine. Use vitamin C morning, retinol night.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a balanced moisturizer with peptides and antioxidants. Add a richer night cream for repair.', warning: 'Collagen loss starts in your 30s. Peptide moisturizers help signal the skin to produce more.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50 every morning without exception. Consider a physical block (mineral) sunscreen for best protection.', warning: 'Your 30s are when sun damage from your 20s starts showing. SPF stops further damage immediately.' },
  ],

  normal_adult_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a balanced gel cleanser morning and night. Always cleanse after work to remove pollutants.', warning: 'Urban pollution damages normal skin in your 30s more than you realize. Cleansing is protective.' },
    { step: 'Step 2 — Tone', tip: 'Apply a niacinamide toner to maintain skin balance and address early pore concerns.', warning: 'Normal skin becomes more reactive to stress and lifestyle factors after 30. Toning helps balance.' },
    { step: 'Step 3 — Treat', tip: 'Start using a retinol serum 2 nights per week. This is the single most effective anti-aging ingredient.', warning: 'Retinol takes 3 months to show results. Do not stop because you do not see changes immediately.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a moisturizer with peptides and antioxidants morning and night. Apply to neck and jawline too.', warning: 'Men\'s skin thins after 35. Moisturizer and peptides slow this process significantly.' },
    { step: 'Step 5 — Protect', tip: 'Use SPF 50 daily. Combine with protective clothing for outdoor activities lasting over 30 minutes.', warning: 'Skin cancer risk increases every decade. Daily SPF is not vanity — it is health protection.' },
  ],

  normal_adult_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle cleanser suited to your current skin state — normal skin shifts with seasons and stress.', warning: 'Normal skin in your 30s may become combination type. Adjust your cleanser if you notice changes.' },
    { step: 'Step 2 — Tone', tip: 'Apply a hydrating toner daily and an exfoliating toner once or twice per week for cell turnover.', warning: 'Cell turnover slows in your 30s. Gentle exfoliation helps products absorb better and skin look fresher.' },
    { step: 'Step 3 — Treat', tip: 'Use retinol at night and vitamin C in the morning as your core anti-aging routine in your 30s.', warning: 'These are the two most evidence-backed anti-aging ingredients. Consistency is more important than quantity.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a peptide-rich moisturizer. Apply eye cream morning and night to protect the delicate eye area.', warning: 'The eye area shows aging first. Dedicated eye cream from 30 onward makes a visible difference by 40.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50 every morning. Reapply after lunch if you spend time near windows or outdoors.', warning: 'Window glass blocks UVB but not UVA rays. UVA causes aging even indoors near windows.' },
  ],

  normal_mature_female: [
    { step: 'Step 1 — Cleanse', tip: 'Use a nourishing oil or balm cleanser at night. In the morning use thermal water or a gentle rinse only.', warning: 'Mature normal skin becomes drier with age. Over-cleansing accelerates this process dramatically.' },
    { step: 'Step 2 — Tone', tip: 'Apply a deeply hydrating essence with hyaluronic acid and peptides as the first step after cleansing.', warning: 'Exfoliating toners should be used maximum once per week on mature skin. Less is more after 45.' },
    { step: 'Step 3 — Treat', tip: 'Apply growth factor or peptide serum for collagen stimulation. Use low-strength retinol once or twice weekly.', warning: 'Mature skin is sensitive to strong active ingredients. Always patch test and introduce slowly.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich cream with ceramides, peptides, and squalane. Apply to face, neck, décolletage, and hands.', warning: 'After 45, hormonal changes make skin significantly drier. Rich moisturizer is essential, not optional.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50+ with antioxidants every morning. Apply to all exposed skin, not just the face.', warning: 'Post-menopausal skin is extremely susceptible to UV damage. This is the most critical age for SPF.' },
  ],

  normal_mature_male: [
    { step: 'Step 1 — Cleanse', tip: 'Use a gentle cream cleanser at night. Morning rinse only. If shaving use a pre-shave oil to protect skin.', warning: 'Mature skin repairs more slowly after shaving irritation. Use protective products every time.' },
    { step: 'Step 2 — Tone', tip: 'Apply a rich hydrating toner with peptides and hyaluronic acid to support aging skin structure.', warning: 'Astringent or clarifying toners are completely wrong for mature skin. Avoid them entirely.' },
    { step: 'Step 3 — Treat', tip: 'Use a peptide serum every evening to stimulate collagen and improve skin firmness and texture.', warning: 'Strong retinol is too harsh for mature male skin. Choose low-strength or peptide alternatives instead.' },
    { step: 'Step 4 — Moisturize', tip: 'Use a rich moisturizer on face and neck. Apply hand cream daily — hands age as fast as the face.', warning: 'Neglecting the neck is the most common mistake in older men. It shows age more than the face.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50+ every morning on face, neck, and hands. Reapply midday if outdoors.', warning: 'Older men have the highest rate of melanoma. SPF is literally life-saving at this age.' },
  ],

  normal_mature_other: [
    { step: 'Step 1 — Cleanse', tip: 'Use a rich cleansing balm that nourishes while it cleanses. Do not rinse completely dry.', warning: 'Leaving a thin film of cleanser on mature skin is beneficial — it adds a layer of protection.' },
    { step: 'Step 2 — Tone', tip: 'Apply a deeply nourishing essence with plant stem cells and hyaluronic acid for plumping effect.', warning: 'After 45 the skin barrier is significantly weaker. Anything that stings or burns should be stopped immediately.' },
    { step: 'Step 3 — Treat', tip: 'Apply a growth factor or collagen-stimulating serum as the primary treatment after 45.', warning: 'Retinol works but is harsh on mature skin. If using it, choose 0.025% and never more than once per week.' },
    { step: 'Step 4 — Moisturize', tip: 'Use the richest moisturizer available with ceramides, peptides, and squalane. Apply generously.', warning: 'Mature skin cannot over-moisturize. More is better at this stage — apply as much as absorbs.' },
    { step: 'Step 5 — Protect', tip: 'SPF 50+ every morning all year round on all exposed skin. Never skip regardless of season.', warning: 'UV radiation is present even in winter and through clouds. Daily SPF 50 is the rule, not the exception.' },
  ],
}

export default SKIN_TIPS