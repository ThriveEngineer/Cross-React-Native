Pod::Spec.new do |s|
  s.name           = 'Material3Expressive'
  s.version        = '1.0.0'
  s.summary        = 'Material 3 Expressive native module'
  s.description    = 'Native iOS module for Material 3 Expressive components'
  s.author         = ''
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '16.0' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '*.swift'
  s.swift_version = '5.4'
end
