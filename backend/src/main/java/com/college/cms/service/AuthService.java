package com.college.cms.service;

import com.college.cms.dto.JwtAuthResponse;
import com.college.cms.dto.LoginDto;

public interface AuthService {
    JwtAuthResponse login(LoginDto loginDto);
}
