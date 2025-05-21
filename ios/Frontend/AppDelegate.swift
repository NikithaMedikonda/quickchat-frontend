import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Security

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    if !UserDefaults.standard.bool(forKey: "hasLaunchedBefore") {
      clearUserDefaults()
      clearAppFiles()
      clearKeychain()

      UserDefaults.standard.set(true, forKey: "hasLaunchedBefore")
      UserDefaults.standard.synchronize()
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Frontend",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

func clearUserDefaults() {
  let domain = Bundle.main.bundleIdentifier!
  UserDefaults.standard.removePersistentDomain(forName: domain)
  UserDefaults.standard.synchronize()
}

func clearAppFiles() {
  let fileManager = FileManager.default

  let directories: [URL?] = [
    fileManager.urls(for: .documentDirectory, in: .userDomainMask).first,
    fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first,
    URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
  ]

  for dir in directories {
    guard let dir = dir else { continue }

    do {
      let files = try fileManager.contentsOfDirectory(atPath: dir.path)
      for file in files {
        let filePath = dir.appendingPathComponent(file).path
        try fileManager.removeItem(atPath: filePath)
      }
    } catch {
      print("Failed to clear directory: \(dir.path), error: \(error)")
    }
  }
}

func clearKeychain() {
  let secItemClasses = [
    kSecClassGenericPassword,
    kSecClassInternetPassword,
    kSecClassCertificate,
    kSecClassKey,
    kSecClassIdentity
  ]

  for itemClass in secItemClasses {
    let query = [kSecClass as String: itemClass]
    let status = SecItemDelete(query as CFDictionary)
    if status != errSecSuccess && status != errSecItemNotFound {
      print("Failed to delete keychain items for class \(itemClass): \(status)")
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
