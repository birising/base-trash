//
//  ReportView.swift
//  BelokyZavady
//
//  Hlavní view pro hlášení závad
//

import SwiftUI
import MapKit
import CoreLocation
import PhotosUI

struct ReportView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var selectedCategory: ZavadaCategory? = nil
    @State private var description: String = ""
    @State private var email: String = ""
    @State private var selectedLocation: CLLocationCoordinate2D? = nil
    @State private var selectedPhoto: UIImage? = nil
    @State private var showPhotoPicker = false
    @State private var showCamera = false
    @State private var isSubmitting = false
    @State private var showAlert = false
    @State private var alertMessage = ""
    @State private var alertTitle = ""
    
    var body: some View {
        NavigationView {
            Form {
                // Sekce: Kategorie
                Section(header: Text("Kategorie závady")) {
                    Picker("Kategorie", selection: $selectedCategory) {
                        Text("Vyberte kategorii").tag(nil as ZavadaCategory?)
                        ForEach(ZavadaCategory.allCases) { category in
                            HStack {
                                Image(systemName: category.icon)
                                Text(category.displayName)
                            }
                            .tag(category as ZavadaCategory?)
                        }
                    }
                }
                
                // Sekce: Mapa
                Section(header: Text("Místo závady")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Klikněte na mapu pro výběr místa závady")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        MapView(
                            selectedLocation: $selectedLocation,
                            userLocation: $locationManager.userLocation
                        )
                        .frame(height: 300)
                        .cornerRadius(8)
                        
                        if let location = selectedLocation {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                Text(String(format: "%.6f, %.6f", location.latitude, location.longitude))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        } else if let userLocation = locationManager.userLocation {
                            Button(action: {
                                selectedLocation = userLocation
                            }) {
                                HStack {
                                    Image(systemName: "location.fill")
                                    Text("Použít aktuální polohu")
                                }
                            }
                        }
                    }
                }
                
                // Sekce: Popis
                Section(header: Text("Popis závady")) {
                    TextEditor(text: $description)
                        .frame(minHeight: 100)
                }
                
                // Sekce: Email
                Section(header: Text("Kontakt (volitelné)")) {
                    TextField("vas@email.cz", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                
                // Sekce: Fotografie
                Section(header: Text("Fotografie (volitelné)")) {
                    if let photo = selectedPhoto {
                        VStack {
                            Image(uiImage: photo)
                                .resizable()
                                .scaledToFit()
                                .frame(maxHeight: 200)
                                .cornerRadius(8)
                            
                            Button(action: {
                                selectedPhoto = nil
                            }) {
                                Text("Odstranit fotku")
                                    .foregroundColor(.red)
                            }
                        }
                    } else {
                        HStack {
                            Button(action: {
                                showPhotoPicker = true
                            }) {
                                HStack {
                                    Image(systemName: "photo")
                                    Text("Vybrat z galerie")
                                }
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                showCamera = true
                            }) {
                                HStack {
                                    Image(systemName: "camera")
                                    Text("Pořídit fotku")
                                }
                            }
                        }
                    }
                }
                
                // Tlačítko pro odeslání
                Section {
                    Button(action: submitReport) {
                        HStack {
                            if isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Odeslat závadu")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .foregroundColor(.white)
                        .padding()
                        .background(canSubmit ? Color.blue : Color.gray)
                        .cornerRadius(8)
                    }
                    .disabled(!canSubmit || isSubmitting)
                }
            }
            .navigationTitle("Nahlásit závadu")
            .sheet(isPresented: $showPhotoPicker) {
                PhotoPicker(selectedImage: $selectedPhoto)
            }
            .sheet(isPresented: $showCamera) {
                CameraView(selectedImage: $selectedPhoto)
            }
            .alert(alertTitle, isPresented: $showAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(alertMessage)
            }
            .onAppear {
                locationManager.requestLocation()
            }
        }
    }
    
    private var canSubmit: Bool {
        selectedCategory != nil &&
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        selectedLocation != nil
    }
    
    private func submitReport() {
        guard let category = selectedCategory,
              let location = selectedLocation else {
            showAlert(title: "Chyba", message: "Vyplňte prosím všechny povinné údaje")
            return
        }
        
        isSubmitting = true
        
        APIService.submitZavada(
            category: category,
            location: location,
            description: description,
            email: email.isEmpty ? nil : email,
            photo: selectedPhoto
        ) { result in
            isSubmitting = false
            
            switch result {
            case .success(let message):
                showAlert(title: "Úspěch", message: message)
                // Reset formuláře
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    resetForm()
                }
            case .failure(let error):
                showAlert(title: "Chyba", message: error.localizedDescription)
            }
        }
    }
    
    private func resetForm() {
        selectedCategory = nil
        description = ""
        email = ""
        selectedLocation = nil
        selectedPhoto = nil
    }
    
    private func showAlert(title: String, message: String) {
        alertTitle = title
        alertMessage = message
        showAlert = true
    }
}

// Location Manager
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var userLocation: CLLocationCoordinate2D?
    
    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestLocation() {
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            userLocation = location.coordinate
            manager.stopUpdatingLocation()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
    }
}

// Photo Picker
struct PhotoPicker: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.filter = .images
        config.selectionLimit = 1
        
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: PhotoPicker
        
        init(_ parent: PhotoPicker) {
            self.parent = parent
        }
        
        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            parent.presentationMode.wrappedValue.dismiss()
            
            guard let result = results.first else { return }
            
            result.item.loadObject(ofClass: UIImage.self) { object, error in
                if let image = object as? UIImage {
                    DispatchQueue.main.async {
                        self.parent.selectedImage = image
                    }
                }
            }
        }
    }
}

// Camera View
struct CameraView: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        picker.allowsEditing = true
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.editedImage] as? UIImage ?? info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}




