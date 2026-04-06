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
exports.Cohorte = void 0;
const typeorm_1 = require("typeorm");
const PlanDeEstudio_1 = require("./PlanDeEstudio");
let Cohorte = class Cohorte {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Cohorte.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Cohorte.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Cohorte.prototype, "fecha_fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }) // p.ej. "2025-1"
    ,
    __metadata("design:type", String)
], Cohorte.prototype, "periodo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlanDeEstudio_1.PlanDeEstudio, (p) => p.cohorte),
    __metadata("design:type", Array)
], Cohorte.prototype, "planes", void 0);
Cohorte = __decorate([
    (0, typeorm_1.Entity)({ name: "cohortes" }),
    (0, typeorm_1.Unique)(["periodo"]) // opcional; quítalo si el periodo puede repetirse
], Cohorte);
exports.Cohorte = Cohorte;
//# sourceMappingURL=Cohorte.js.map