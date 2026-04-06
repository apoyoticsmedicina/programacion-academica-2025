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
exports.ProgramaDocente = void 0;
const typeorm_1 = require("typeorm");
const Docente_1 = require("./Docente");
const ProgramaCurso_1 = require("./ProgramaCurso");
let ProgramaDocente = class ProgramaDocente {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProgramaDocente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Docente_1.Docente, (d) => d.programasAsignados, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "id_docente" }),
    __metadata("design:type", Docente_1.Docente)
], ProgramaDocente.prototype, "docente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProgramaCurso_1.ProgramaCurso, (pc) => pc.docentes, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_programa" }),
    __metadata("design:type", ProgramaCurso_1.ProgramaCurso)
], ProgramaDocente.prototype, "programaCurso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", String)
], ProgramaDocente.prototype, "porcentaje", void 0);
ProgramaDocente = __decorate([
    (0, typeorm_1.Entity)({ name: "programas_docente" })
], ProgramaDocente);
exports.ProgramaDocente = ProgramaDocente;
//# sourceMappingURL=ProgramaDocente.js.map