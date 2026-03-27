import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoServidorComponent } from './estado-servidor.component';

describe('EstadoServidorComponent', () => {
  let component: EstadoServidorComponent;
  let fixture: ComponentFixture<EstadoServidorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoServidorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoServidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
