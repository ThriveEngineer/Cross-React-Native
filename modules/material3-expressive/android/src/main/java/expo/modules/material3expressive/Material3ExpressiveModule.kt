package expo.modules.material3expressive

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class Material3ExpressiveModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("Material3Expressive")

        // M3 Expressive Button View
        View(M3ExpressiveButton::class) {
            Prop("label") { view: M3ExpressiveButton, label: String ->
                view.setLabel(label)
            }

            Prop("variant") { view: M3ExpressiveButton, variant: String ->
                view.setVariant(variant)
            }

            Prop("enabled") { view: M3ExpressiveButton, enabled: Boolean ->
                view.setButtonEnabled(enabled)
            }
        }

        // M3 Expressive Card View
        View(M3ExpressiveCard::class) {
            Prop("variant") { view: M3ExpressiveCard, variant: String ->
                view.setVariant(variant)
            }
        }

        // M3 Expressive FAB View
        View(M3ExpressiveFAB::class) {
            Prop("icon") { view: M3ExpressiveFAB, icon: String ->
                view.setIcon(icon)
            }

            Prop("label") { view: M3ExpressiveFAB, label: String? ->
                view.setLabel(label)
            }

            Prop("expanded") { view: M3ExpressiveFAB, expanded: Boolean ->
                view.setExpanded(expanded)
            }
        }

        // M3 Expressive Loading Indicator
        View(M3ExpressiveLoadingIndicator::class) {
            Prop("variant") { view: M3ExpressiveLoadingIndicator, variant: String ->
                view.setVariant(variant)
            }

            Prop("progress") { view: M3ExpressiveLoadingIndicator, progress: Float? ->
                view.setProgress(progress)
            }
        }
    }
}
