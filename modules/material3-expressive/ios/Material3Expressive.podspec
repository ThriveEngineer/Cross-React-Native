Pod::Spec.new do |s|
  s.name           = 'Material3Expressive'
  s.version        = '1.0.0'
  s.summary        = 'Native Material 3 Expressive components for iOS'
  s.description    = 'Provides native iOS bottom sheets and UI components with UISheetPresentationController'
  s.author         = ''
  s.homepage       = 'https://github.com/user/material3-expressive'
  s.platforms      = { :ios => '15.0' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '*.swift'
  s.swift_version = '5.4'
end
