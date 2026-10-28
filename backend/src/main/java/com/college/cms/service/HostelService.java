package com.college.cms.service;

import com.college.cms.dto.HostelAllocationDto;
import com.college.cms.dto.HostelDto;
import com.college.cms.dto.HostelRoomDto;

import java.util.List;

public interface HostelService {
    HostelDto createHostel(HostelDto hostelDto);
    HostelRoomDto createRoom(HostelRoomDto roomDto);
    HostelAllocationDto allocateRoom(Long studentId, Long roomId);
    HostelAllocationDto vacateRoom(Long studentId);
    List<HostelDto> getAllHostels();
    List<HostelRoomDto> getRoomsByHostel(Long hostelId);
    HostelAllocationDto getCurrentAllocationForStudent(Long studentId);
}
