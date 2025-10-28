import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/website_provider.dart';
import '../components/components_list_screen.dart';
import '../products/products_list_screen.dart';
import '../categories/categories_list_screen.dart';

class WebsiteDetailScreen extends StatelessWidget {
  const WebsiteDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final websiteProvider = Provider.of<WebsiteProvider>(context);
    final website = websiteProvider.selectedWebsite;

    if (website == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Website')),
        body: const Center(child: Text('No website selected')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(website.title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Website Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.web, size: 32),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                website.title,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${website.subdomain}.ezweb.com',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: website.published
                                ? Colors.green[100]
                                : Colors.orange[100],
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            website.published ? 'Published' : 'Draft',
                            style: TextStyle(
                              color: website.published
                                  ? Colors.green[800]
                                  : Colors.orange[800],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (website.description != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        website.description!,
                        style: TextStyle(color: Colors.grey[700]),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Management Options
            Text(
              'Manage Website',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),

            // Components Management
            _ManagementOption(
              icon: Icons.view_module,
              title: 'Manage Components',
              subtitle: 'Add, edit, and reorder components',
              color: Colors.blue,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ComponentsListScreen(websiteId: website.id),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),

            // Products Management
            _ManagementOption(
              icon: Icons.shopping_bag,
              title: 'Manage Products',
              subtitle: 'Add, edit, and delete products',
              color: Colors.green,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ProductsListScreen(websiteId: website.id),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),

            // Categories Management
            _ManagementOption(
              icon: Icons.category,
              title: 'Manage Categories',
              subtitle: 'Organize products with categories',
              color: Colors.purple,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => CategoriesListScreen(websiteId: website.id),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),

            // Settings (Future)
            _ManagementOption(
              icon: Icons.settings,
              title: 'Website Settings',
              subtitle: 'Edit website details and settings',
              color: Colors.orange,
              onTap: () {
                // TODO: Implement settings screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Coming soon!')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ManagementOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ManagementOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
