export class ErrorReturnDto {
  type!: "error";
  message!: string;
}

export class SignupDto {
  email!: string;
  password!: string;
  name!: string;
}

export class SignupReturnDto {
  type!: "success";
  message!: string;
}

export class SigninDto {
  email!: string;
  password!: string;
}

export class SigninReturnDto {
  type!: "success" | "error";
  message?: string;
  userName?: string;
  user_dark_mode?: boolean;
  user_email!: string;
}
