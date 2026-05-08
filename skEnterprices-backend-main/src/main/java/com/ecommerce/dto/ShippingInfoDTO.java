package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfoDTO {
    private String name;
    private String email;
    private String address;
    private String city;
    private String zipCode;
}

