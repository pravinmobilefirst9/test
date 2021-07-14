import { Component, OnInit } from '@angular/core';
import { Route, ActivatedRouteSnapshot, Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  error;

  constructor() {}

  ngOnInit() {}
}
