"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_production_dto_1 = require("./create-production.dto");
class UpdateProductionDto extends (0, mapped_types_1.PartialType)(create_production_dto_1.CreateProductionDto) {
    id;
}
exports.UpdateProductionDto = UpdateProductionDto;
//# sourceMappingURL=update-production.dto.js.map