import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
imports: [MatSidenavModule, MatCardModule],
exports: [MatSidenavModule, MatCardModule, MatDividerModule, MatButtonModule, MatSlideToggleModule, MatToolbarModule]
})

export class MaterialModule { }
