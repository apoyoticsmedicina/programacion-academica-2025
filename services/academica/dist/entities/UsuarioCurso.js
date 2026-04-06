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
exports.UsuarioCurso = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Curso_1 = require("./Curso");
let UsuarioCurso = class UsuarioCurso {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UsuarioCurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "usuario_id" }),
    (0, typeorm_1.Index)("IDX_uc_usuario"),
    __metadata("design:type", Usuario_1.Usuario)
], UsuarioCurso.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Curso_1.Curso, { nullable: false, onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "curso_id" }),
    (0, typeorm_1.Index)("IDX_uc_curso"),
    __metadata("design:type", Curso_1.Curso)
], UsuarioCurso.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz", name: "creado_en" }),
    __metadata("design:type", Date)
], UsuarioCurso.prototype, "creado_en", void 0);
UsuarioCurso = __decorate([
    (0, typeorm_1.Entity)({ name: "usuarios_cursos" }),
    (0, typeorm_1.Unique)("UQ_uc_usuario_curso", ["usuario", "curso"])
], UsuarioCurso);
exports.UsuarioCurso = UsuarioCurso;
//# sourceMappingURL=UsuarioCurso.js.map