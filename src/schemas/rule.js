import z from "zod";

const baseRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(""),
  hint: z.string().catch(""),
  rule_type: z.enum(["account", "content", "group"]).nullable().catch(null),
});

const ruleSchema = z.preprocess((data) => {
  return {
    ...data,
    hint: data.hint || data.subtext,
  };
}, baseRuleSchema);

const adminRuleSchema = baseRuleSchema.extend({
  priority: z.number().nullable().catch(null),
});

export { ruleSchema, adminRuleSchema };
