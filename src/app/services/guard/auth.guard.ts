import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const localData = localStorage.getItem("loggedUser")

  // if (localData !=null) {
  //   return true;
  // }else{
  //   router.navigateByUrl("auth");
  //   return false;
  // }
  // for now Im commenting this condition because login page is not completed 
  return true;
};
