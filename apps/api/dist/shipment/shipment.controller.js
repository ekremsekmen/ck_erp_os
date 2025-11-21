"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const common_1 = require("@nestjs/common");
const shipment_service_1 = require("./shipment.service");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const update_shipment_dto_1 = require("./dto/update-shipment.dto");
let ShipmentController = class ShipmentController {
    shipmentService;
    constructor(shipmentService) {
        this.shipmentService = shipmentService;
    }
    create(createShipmentDto) {
        return this.shipmentService.create(createShipmentDto);
    }
    findAll() {
        return this.shipmentService.findAll();
    }
    findOne(id) {
        return this.shipmentService.findOne(id);
    }
    update(id, updateShipmentDto) {
        return this.shipmentService.update(id, updateShipmentDto);
    }
    remove(id) {
        return this.shipmentService.remove(id);
    }
    async getWaybillPdf(id, res) {
        const buffer = await this.shipmentService.getWaybillPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=waybill-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.ShipmentController = ShipmentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipment_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], ShipmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shipment_dto_1.UpdateShipmentDto]),
    __metadata("design:returntype", void 0)
], ShipmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/waybill'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentController.prototype, "getWaybillPdf", null);
exports.ShipmentController = ShipmentController = __decorate([
    (0, common_1.Controller)('shipment'),
    __metadata("design:paramtypes", [shipment_service_1.ShipmentService])
], ShipmentController);
//# sourceMappingURL=shipment.controller.js.map