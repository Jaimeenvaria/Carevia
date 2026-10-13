/**
 * Calculates an explainable AI Match score (0 to 100%) for doctor recommendations based on structured criteria.
 * Explicitly non-diagnostic recommendation match rating.
 */
const computeDoctorMatchScore = (doctor, criteria = {}) => {
    let score = 70; // baseline score
    const breakdown = [];

    // Specialty match
    if (criteria.specialty) {
        const specMatch = doctor.specialty.toLowerCase() === criteria.specialty.toLowerCase();
        const subMatch = (doctor.subSpecialties || []).some(s => s.toLowerCase().includes(criteria.specialty.toLowerCase()));
        if (specMatch) {
            score += 15;
            breakdown.push("Direct Specialty Match (+15%)");
        } else if (subMatch) {
            score += 10;
            breakdown.push("Sub-specialty Relevance (+10%)");
        }
    }

    // Location match
    if (criteria.city) {
        if (doctor.city.toLowerCase() === criteria.city.toLowerCase()) {
            score += 10;
            breakdown.push("Location / City Match (+10%)");
        }
    }

    // Rating & Experience bonus
    if (doctor.rating >= 4.7) {
        score += 3;
        breakdown.push("Top Clinical Patient Rating (+3%)");
    }
    if (doctor.experienceYears >= 10) {
        score += 2;
        breakdown.push(`Senior Clinical Experience (${doctor.experienceYears}+ Yrs) (+2%)`);
    }

    // Cap at 98% (never 100% to reflect non-absolute AI match)
    const finalScore = Math.min(98, Math.max(60, score));

    return {
        matchScore: finalScore,
        explanation: breakdown.join(" • ") || "General Primary & Specialist Fit"
    };
};

module.exports = { computeDoctorMatchScore };
