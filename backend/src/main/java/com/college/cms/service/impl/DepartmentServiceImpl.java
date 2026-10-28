package com.college.cms.service.impl;

import com.college.cms.dto.DepartmentDto;
import com.college.cms.entity.Department;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.DepartmentRepository;
import com.college.cms.service.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        // Check for duplicates
        if (departmentRepository.existsByName(departmentDto.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department name already exists.");
        }
        if (departmentRepository.existsByCode(departmentDto.getCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department code already exists.");
        }

        Department department = mapToEntity(departmentDto);
        Department savedDepartment = departmentRepository.save(department);
        return mapToDto(savedDepartment);
    }

    @Override
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToDto(department);
    }

    @Override
    public List<DepartmentDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        // Check if name is changing and causes duplicate
        if (!department.getName().equalsIgnoreCase(departmentDto.getName()) && 
            departmentRepository.existsByName(departmentDto.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department name already exists.");
        }

        // Check if code is changing and causes duplicate
        if (!department.getCode().equalsIgnoreCase(departmentDto.getCode()) && 
            departmentRepository.existsByCode(departmentDto.getCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department code already exists.");
        }

        department.setName(departmentDto.getName());
        department.setCode(departmentDto.getCode());
        department.setDescription(departmentDto.getDescription());

        Department updatedDepartment = departmentRepository.save(department);
        return mapToDto(updatedDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        departmentRepository.delete(department);
    }

    // Map Entity to DTO
    private DepartmentDto mapToDto(Department department) {
        return DepartmentDto.builder()
                .id(department.getId())
                .name(department.getName())
                .code(department.getCode())
                .description(department.getDescription())
                .build();
    }

    // Map DTO to Entity
    private Department mapToEntity(DepartmentDto departmentDto) {
        return Department.builder()
                .name(departmentDto.getName())
                .code(departmentDto.getCode())
                .description(departmentDto.getDescription())
                .build();
    }
}
