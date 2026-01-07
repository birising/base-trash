//
//  APIService.swift
//  BelokyZavady
//
//  Service pro odesílání závad přes API
//

import Foundation
import UIKit

class APIService {
    // Formspree endpoint - stejný jako ve webové aplikaci
    static let formspreeEndpoint = "https://formspree.io/f/xkgdbplk"
    
    static func submitZavada(
        category: ZavadaCategory,
        location: CLLocationCoordinate2D,
        description: String,
        email: String?,
        photo: UIImage?,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        // Vytvoření URL
        guard let url = URL(string: formspreeEndpoint) else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        // Vytvoření multipart/form-data requestu
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Form type
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"form_type\"\r\n\r\n".data(using: .utf8)!)
        body.append("zavada_report\r\n".data(using: .utf8)!)
        
        // Category
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"category\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(category.rawValue)\r\n".data(using: .utf8)!)
        
        // Latitude
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"lat\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(location.latitude)\r\n".data(using: .utf8)!)
        
        // Longitude
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"lng\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(location.longitude)\r\n".data(using: .utf8)!)
        
        // Description
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"message\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(description)\r\n".data(using: .utf8)!)
        
        // Email (pokud je zadán)
        if let email = email, !email.isEmpty {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"email\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(email)\r\n".data(using: .utf8)!)
        }
        
        // Photo (pokud je vybrána)
        if let photo = photo, let imageData = photo.jpegData(compressionQuality: 0.8) {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"upload\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
        }
        
        // Closing boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        // Odeslání requestu
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                DispatchQueue.main.async {
                    completion(.failure(APIError.invalidResponse))
                }
                return
            }
            
            // Formspree vrací 200 nebo 302 při úspěchu
            if httpResponse.statusCode == 200 || httpResponse.statusCode == 302 {
                DispatchQueue.main.async {
                    completion(.success("Závada byla úspěšně nahlášena"))
                }
            } else {
                DispatchQueue.main.async {
                    completion(.failure(APIError.serverError(httpResponse.statusCode)))
                }
            }
        }.resume()
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Neplatná URL adresa"
        case .invalidResponse:
            return "Neplatná odpověď ze serveru"
        case .serverError(let code):
            return "Chyba serveru: \(code)"
        }
    }
}





