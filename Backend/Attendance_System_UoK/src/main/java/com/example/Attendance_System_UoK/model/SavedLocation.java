package com.example.Attendance_System_UoK.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "saved_locations")
public class SavedLocation {
    @Id
    private String id;
    private String name;
    private List<GeoPoint> boundary;
}
