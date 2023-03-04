import { body, param } from "express-validator";

const companyNameRules = (() => {
  return [
    body("name")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Name Can not be empty"),
  ];
})();

const companyParamRules = (() => {
  return [param("id").isInt().withMessage("ID must be an integer").toInt()];
})();

export { companyNameRules, companyParamRules };
