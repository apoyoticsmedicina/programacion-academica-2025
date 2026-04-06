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
exports.ModalidadCurso = void 0;
const typeorm_1 = require("typeorm");
const ProgramaCurso_1 = require("./ProgramaCurso");
let ModalidadCurso = class ModalidadCurso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ModalidadCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], ModalidadCurso.prototype, "modalidad", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.modalidad),
    __metadata("design:type", Array)
], ModalidadCurso.prototype, "programas", void 0);
ModalidadCurso = __decorate([
    (0, typeorm_1.Entity)({ name: "modalidades_curso" }),
    (0, typeorm_1.Unique)(["modalidad"])
], ModalidadCurso);
exports.ModalidadCurso = ModalidadCurso;
//# sourceMappingURL=ModalidadCurso.js.map