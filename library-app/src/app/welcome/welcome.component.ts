import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { WelcomeService } from './welcome.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  userSignUp: FormGroup;
  ngOnInit(): void {
    this.userSignUp = new FormGroup({
      lastName: new FormControl(),
      firstName: new FormControl(),
      email:new FormControl(),
      address: new FormControl()
    });
  }

  constructor(private welcomeService: WelcomeService,private router: Router) { }

  title = 'library-app';
  saveGroup(): void {
    let firstName = this.userSignUp.get('firstName')!.value;
    let lastName = this.userSignUp.get('lastName')!.value;
    let email = this.userSignUp.get('email')!.value;
    let address = this.userSignUp.get('address')!.value;
    this.welcomeService.saveUser(firstName,lastName,email,address)
    .subscribe(
      (      _: any) => console.log("Saved"),
      (      err: any) => console.log("Error", err)
    );
  }

  gotoBook():void {
    this.router.navigate(['/book']);
  }

}
