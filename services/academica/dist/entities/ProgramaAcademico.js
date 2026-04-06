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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaAcademico = void 0;
const typeorm_1 = require("typeorm");
const PlanDeEstudio_1 = require("./PlanDeEstudio");
let ProgramaAcademico = class ProgramaAcademico {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaAcademico.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", Number)
], ProgramaAcademico.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], ProgramaAcademico.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }) // "pregrado" | "posgrado"
    ,
    __metadata("design:type", String)
], ProgramaAcademico.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlanDeEstudio_1.PlanDeEstudio, (p) => p.programa),
    __metadata("design:type", Array)
], ProgramaAcademico.prototype, "planes", void 0);
ProgramaAcademico = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_academicos" }),
    (0, typeorm_1.Check)(`"codigo" > 0`)
], ProgramaAcademico);
exports.ProgramaAcademico = ProgramaAcademico;
//# sourceMappingURL=ProgramaAcademico.js.map