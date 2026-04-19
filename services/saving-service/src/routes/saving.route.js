const express = require("express");
const router = express.Router();
const controller = require("../controllers/saving.controller");
const installmentController = require("../controllers/savingInstallment.controller");

router.post("/", controller.create);
router.get("/all", controller.getAllPlans);
router.get("/detail/:id", controller.getById);
router.get("/:user_id/stats", controller.getStats);
router.get("/:user_id/top", controller.getTopPlans);
router.get("/:id/history", controller.getProgressHistory);
router.get("/:user_id", controller.getAllByUser);
router.put("/:id/progress", controller.updateProgress);
router.put("/:id/complete", controller.markCompleted);
router.put("/:id", controller.updateInfo);
router.delete("/:id", controller.delete);

router.post("/:saving_plan_id/installments", installmentController.addInstallment);
router.get("/:saving_plan_id/installments", installmentController.getByPlan);
router.delete("/installments/:id", installmentController.delete);

module.exports = router;
