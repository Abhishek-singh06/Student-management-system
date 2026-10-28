package com.college.cms.service.impl;

import com.college.cms.dto.HostelAllocationDto;
import com.college.cms.dto.HostelDto;
import com.college.cms.dto.HostelRoomDto;
import com.college.cms.entity.Hostel;
import com.college.cms.entity.HostelAllocation;
import com.college.cms.entity.HostelRoom;
import com.college.cms.entity.Student;
import com.college.cms.exception.ApiException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.HostelAllocationRepository;
import com.college.cms.repository.HostelRepository;
import com.college.cms.repository.HostelRoomRepository;
import com.college.cms.repository.StudentRepository;
import com.college.cms.service.HostelService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HostelServiceImpl implements HostelService {

    private final HostelRepository hostelRepository;
    private final HostelRoomRepository roomRepository;
    private final HostelAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;

    public HostelServiceImpl(HostelRepository hostelRepository,
                             HostelRoomRepository roomRepository,
                             HostelAllocationRepository allocationRepository,
                             StudentRepository studentRepository) {
        this.hostelRepository = hostelRepository;
        this.roomRepository = roomRepository;
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public HostelDto createHostel(HostelDto dto) {
        if (hostelRepository.existsByName(dto.getName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hostel name already exists.");
        }
        Hostel hostel = Hostel.builder()
                .name(dto.getName())
                .type(dto.getType().toUpperCase())
                .capacity(dto.getCapacity())
                .address(dto.getAddress())
                .build();
        Hostel saved = hostelRepository.save(hostel);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public HostelRoomDto createRoom(HostelRoomDto dto) {
        Hostel hostel = hostelRepository.findById(dto.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", dto.getHostelId()));

        if (roomRepository.existsByHostelIdAndRoomNumber(dto.getHostelId(), dto.getRoomNumber())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Room number already exists in this hostel.");
        }

        HostelRoom room = HostelRoom.builder()
                .hostel(hostel)
                .roomNumber(dto.getRoomNumber())
                .capacity(dto.getCapacity())
                .rentPerSemester(dto.getRentPerSemester())
                .build();

        HostelRoom saved = roomRepository.save(room);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public HostelAllocationDto allocateRoom(Long studentId, Long roomId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        HostelRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("HostelRoom", "id", roomId));

        // Validate capacity
        if (room.getOccupancy() >= room.getCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Room is already fully occupied.");
        }

        // Validate double allocation
        if (allocationRepository.existsByStudentIdAndStatus(studentId, "ACTIVE")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Student is already allocated a hostel room.");
        }

        // Create allocation
        HostelAllocation allocation = HostelAllocation.builder()
                .student(student)
                .room(room)
                .status("ACTIVE")
                .build();

        // Increment occupancy
        room.setOccupancy(room.getOccupancy() + 1);
        roomRepository.save(room);

        HostelAllocation saved = allocationRepository.save(allocation);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public HostelAllocationDto vacateRoom(Long studentId) {
        HostelAllocation allocation = allocationRepository.findByStudentIdAndStatus(studentId, "ACTIVE")
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No active hostel allocation found for this student."));

        allocation.setStatus("VACATED");
        allocation.setVacatedDate(LocalDate.now());

        HostelRoom room = allocation.getRoom();
        if (room.getOccupancy() > 0) {
            room.setOccupancy(room.getOccupancy() - 1);
            roomRepository.save(room);
        }

        HostelAllocation saved = allocationRepository.save(allocation);
        return mapToDto(saved);
    }

    @Override
    public List<HostelDto> getAllHostels() {
        return hostelRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<HostelRoomDto> getRoomsByHostel(Long hostelId) {
        return roomRepository.findByHostelId(hostelId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public HostelAllocationDto getCurrentAllocationForStudent(Long studentId) {
        Optional<HostelAllocation> optional = allocationRepository.findByStudentIdAndStatus(studentId, "ACTIVE");
        return optional.map(this::mapToDto).orElse(null);
    }

    // Mappers
    private HostelDto mapToDto(Hostel hostel) {
        return HostelDto.builder()
                .id(hostel.getId())
                .name(hostel.getName())
                .type(hostel.getType())
                .capacity(hostel.getCapacity())
                .address(hostel.getAddress())
                .build();
    }

    private HostelRoomDto mapToDto(HostelRoom room) {
        return HostelRoomDto.builder()
                .id(room.getId())
                .hostelId(room.getHostel().getId())
                .hostelName(room.getHostel().getName())
                .roomNumber(room.getRoomNumber())
                .capacity(room.getCapacity())
                .occupancy(room.getOccupancy())
                .rentPerSemester(room.getRentPerSemester())
                .build();
    }

    private HostelAllocationDto mapToDto(HostelAllocation allocation) {
        return HostelAllocationDto.builder()
                .id(allocation.getId())
                .studentId(allocation.getStudent().getId())
                .studentRollNumber(allocation.getStudent().getRollNumber())
                .studentName(allocation.getStudent().getFirstName() + " " + allocation.getStudent().getLastName())
                .roomId(allocation.getRoom().getId())
                .roomNumber(allocation.getRoom().getRoomNumber())
                .hostelName(allocation.getRoom().getHostel().getName())
                .allocationDate(allocation.getAllocationDate())
                .vacatedDate(allocation.getVacatedDate())
                .status(allocation.getStatus())
                .rentPerSemester(allocation.getRoom().getRentPerSemester())
                .build();
    }
}
