package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.query.JwtResponse;
import com.invoicingsystem.api.application.query.UserDto;
import com.invoicingsystem.api.domain.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T23:14:50-0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto userToUserDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.id( user.getId() );
        userDto.name( user.getName() );
        userDto.email( user.getEmail() );
        userDto.role( user.getRole() );
        userDto.createdAt( user.getCreatedAt() );
        userDto.updatedAt( user.getUpdatedAt() );

        return userDto.build();
    }

    @Override
    public List<UserDto> usersToUserDtos(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserDto> list = new ArrayList<UserDto>( users.size() );
        for ( User user : users ) {
            list.add( userToUserDto( user ) );
        }

        return list;
    }

    @Override
    public User createUserCommandToUser(CreateUserCommand command) {
        if ( command == null ) {
            return null;
        }

        User.UserBuilder<?, ?> user = User.builder();

        user.name( command.getName() );
        user.email( command.getEmail() );
        user.password( command.getPassword() );
        user.role( command.getRole() );

        return user.build();
    }

    @Override
    public JwtResponse userToJwtResponse(User user, String token) {
        if ( user == null && token == null ) {
            return null;
        }

        JwtResponse.JwtResponseBuilder jwtResponse = JwtResponse.builder();

        if ( user != null ) {
            if ( user.getRole() != null ) {
                jwtResponse.role( user.getRole().name() );
            }
            jwtResponse.id( user.getId() );
            jwtResponse.name( user.getName() );
            jwtResponse.email( user.getEmail() );
        }
        jwtResponse.token( token );

        return jwtResponse.build();
    }
}
