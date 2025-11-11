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
    date = "2025-11-10T19:09:07-0600",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto userToUserDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.createdAt( user.getCreatedAt() );
        userDto.email( user.getEmail() );
        userDto.id( user.getId() );
        userDto.name( user.getName() );
        userDto.role( user.getRole() );
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

        user.email( command.getEmail() );
        user.name( command.getName() );
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
            jwtResponse.email( user.getEmail() );
            jwtResponse.id( user.getId() );
            jwtResponse.name( user.getName() );
        }
        jwtResponse.token( token );

        return jwtResponse.build();
    }
}
