import z from "zod";

const baseRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(""),
  hint: z.string().catch(""),
  rule_type: z.enum(["account", "content", "group"]).nullable().catch(null),
});

const ruleSchema = z
  .preprocess((data) => {
    // Safety check to prevent crashing on non-object inputs
    if (!data || typeof data !== "object") return {};
    
    return {
      ...data,
      // Map 'subtext' to 'hint' if 'hint' is missing or empty
      hint: data.hint || data.subtext || "",
    };
  }, baseRuleSchema);

const adminRuleSchema = baseRuleSchema.extend({
  // priority is vital for the Admin UI to sort rules correctly
  priority: z.number().int().catch(0),
});

export { ruleSchema, adminRuleSchema };

