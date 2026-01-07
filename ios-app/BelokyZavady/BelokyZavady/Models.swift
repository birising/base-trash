//
//  Models.swift
//  BelokyZavady
//
//  Created for Údržba obce Běloky
//

import Foundation
import CoreLocation

// Kategorie závad
enum ZavadaCategory: String, CaseIterable, Identifiable {
    case kose = "kose"
    case lampy = "lampy"
    case zelen = "zelen"
    case ostatni = "ostatni"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .kose: return "Koš"
        case .lampy: return "Lampa"
        case .zelen: return "Údržba zeleně"
        case .ostatni: return "Ostatní"
        }
    }
    
    var icon: String {
        switch self {
        case .kose: return "trash"
        case .lampy: return "lightbulb"
        case .zelen: return "leaf"
        case .ostatni: return "exclamationmark.triangle"
        }
    }
}

// Model pro hlášení závady
struct ZavadaReport: Codable {
    let category: String
    let lat: Double
    let lng: Double
    let description: String
    let email: String?
    let photoData: Data?
    
    enum CodingKeys: String, CodingKey {
        case category
        case lat
        case lng
        case description = "message"
        case email
    }
}

// Model pro odpověď API
struct APIResponse: Codable {
    let success: Bool
    let message: String?
}





