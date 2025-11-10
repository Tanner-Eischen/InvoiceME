package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.command.LoginCommand;
import com.invoicingsystem.api.application.query.JwtResponse;
import com.invoicingsystem.api.application.query.UserDto;

public interface AuthService {

    JwtResponse login(LoginCommand command);

    UserDto register(CreateUserCommand command);
}
