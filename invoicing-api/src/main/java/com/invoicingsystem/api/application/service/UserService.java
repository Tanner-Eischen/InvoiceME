package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.query.UserDto;

import java.util.List;

public interface UserService {

    List<UserDto> getAllUsers();

    UserDto getUserById(String id);

    UserDto getUserByEmail(String email);

    void deleteUser(String id);
}
