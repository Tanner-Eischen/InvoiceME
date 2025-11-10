package com.invoicingsystem.api.infrastructure.web.controller;

import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.command.LoginCommand;
import com.invoicingsystem.api.application.query.JwtResponse;
import com.invoicingsystem.api.application.query.UserDto;
import com.invoicingsystem.api.application.service.AuthService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginCommand loginCommand) {
        return ResponseEntity.ok(authService.login(loginCommand));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody CreateUserCommand command) {
        return ResponseEntity.ok(authService.register(command));
    }
}
