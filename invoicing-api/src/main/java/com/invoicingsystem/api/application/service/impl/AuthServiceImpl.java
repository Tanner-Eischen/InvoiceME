package com.invoicingsystem.api.application.service.impl;

import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.command.LoginCommand;
import com.invoicingsystem.api.application.mapper.UserMapper;
import com.invoicingsystem.api.application.query.JwtResponse;
import com.invoicingsystem.api.application.query.UserDto;
import com.invoicingsystem.api.application.service.AuthService;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.DuplicateResourceException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.User;
import com.invoicingsystem.api.domain.repository.UserRepository;
import com.invoicingsystem.api.infrastructure.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;

    @Override
    public JwtResponse login(LoginCommand command) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(command.getEmail(), command.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));

        return userMapper.userToJwtResponse(user, jwt);
    }

    @Override
    public UserDto register(CreateUserCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new DuplicateResourceException("User", "email", command.getEmail());
        }

        User user = userMapper.createUserCommandToUser(command);
        user.setPassword(passwordEncoder.encode(command.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return userMapper.userToUserDto(savedUser);
    }
}
