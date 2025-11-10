package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.query.JwtResponse;
import com.invoicingsystem.api.application.query.UserDto;
import com.invoicingsystem.api.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto userToUserDto(User user);

    List<UserDto> usersToUserDtos(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    User createUserCommandToUser(CreateUserCommand command);

    @Mapping(target = "role", source = "user.role")
    JwtResponse userToJwtResponse(User user, String token);
}
